import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "skills" / "handstack-cicd-pipeline" / "scripts"))
import pipeline_lint as p  # noqa: E402

# 비밀 모양의 값은 소스에 리터럴로 두지 않고 실행 중에 조립한다
FAKE_VALUE = "q" + "7Kd" + "-fake-" + "value" + "9981"
KEY_NAME = "api" + "_" + "token"


def codes(text, name="deploy.bat", kind=None, tfm=0, disabled=()):
    kind = kind or p.kind_of(Path(name))
    return {(f["severity"], f["rule"]) for f in p.lint(text, name, kind, set(disabled), tfm)}


class ScriptRules(unittest.TestCase):
    def test_secret_literal_is_flagged_and_masked(self):
        text = f'const {KEY_NAME} = "{FAKE_VALUE}";\n'
        findings = p.lint(text, "tool.sh", "script", set())
        self.assertIn(("ERROR", "secret"), {(f["severity"], f["rule"]) for f in findings})
        self.assertTrue(all(FAKE_VALUE not in f["message"] for f in findings))

    def test_placeholders_and_references_are_not_secrets(self):
        for value in ("CHANGE-THIS-KEY", "${{ secrets.DEPLOY_KEY }}", "%DEPLOY_KEY%", "$(Build.Key)", "<your-token>"):
            text = f'{KEY_NAME}: "{value}"\n'
            self.assertNotIn(("ERROR", "secret"), codes(text, "ci.yml", "ci"), value)

    def test_url_credentials_and_bearer(self):
        self.assertIn(("ERROR", "secret"), codes(f"git clone https://user:{FAKE_VALUE}@host.example/repo.git", "x.sh"))
        self.assertIn(("ERROR", "secret"), codes(f'curl -H "Authorization: Bearer {FAKE_VALUE}" http://h/x', "x.sh"))

    def test_shared_contracts_mirror(self):
        bad = "robocopy Contracts %HANDSTACK_HOME%/contracts /mir /copy:dat\n"
        self.assertIn(("WARN", "shared-mirror"), codes(bad))
        ok_module = "robocopy Contracts %HANDSTACK_HOME%/modules/app/Contracts /mir\n"
        self.assertNotIn(("WARN", "shared-mirror"), codes(ok_module))
        ok_copy = "robocopy Contracts %HANDSTACK_HOME%/contracts /e /copy:dat\n"
        self.assertNotIn(("WARN", "shared-mirror"), codes(ok_copy))
        self.assertIn(("WARN", "shared-mirror"), codes("rsync -a --delete ./Contracts/ $HANDSTACK_HOME/contracts/\n", "d.sh"))

    def test_home_delete(self):
        self.assertIn(("ERROR", "home-delete"), codes('rm -rf "$HANDSTACK_HOME"\n', "clean.sh"))
        self.assertIn(("ERROR", "home-delete"), codes("Remove-Item -Recurse -Force $env:HANDSTACK_HOME\n", "clean.ps1"))
        self.assertNotIn(("ERROR", "home-delete"), codes('rm -rf "$HANDSTACK_HOME/tmp"\n', "clean.sh"))

    def test_stop_all_and_purge(self):
        self.assertIn(("WARN", "stop-all"), codes("handstack stop\n", "s.bat"))
        self.assertNotIn(("WARN", "stop-all"), codes("handstack stop --port=8421\n", "s.bat"))
        self.assertIn(("INFO", "purge-contracts"), codes("handstack purgecontracts --ack=x\n", "s.bat"))

    def test_publish_requires_isolated_home(self):
        self.assertIn(("WARN", "publish-shared-home"), codes("./publish.ps1 win publish Release x64\n", "r.ps1"))
        isolated = '$env:HANDSTACK_HOME = "$PWD/artifacts/home"\n./publish.ps1 win publish Release x64\n'
        self.assertNotIn(("WARN", "publish-shared-home"), codes(isolated, "r.ps1"))

    def test_comments_are_ignored(self):
        self.assertNotIn(("WARN", "stop-all"), codes(":: handstack stop\nREM handstack stop\n", "s.bat"))

    def test_line_numbers_survive_comment_stripping(self):
        text = "# a\n# b\n# c\nhandstack stop\n"
        findings = p.lint(text, "s.sh", "script", set())
        self.assertEqual([f["line"] for f in findings if f["rule"] == "stop-all"], [4])

    def test_env_mix_in_production_script(self):
        text = "copy /Y settings\\ack.development.json out\\syn.config.json\n"
        self.assertIn(("WARN", "env-mix"), codes(text, "deploy-prod.bat"))
        self.assertNotIn(("WARN", "env-mix"), codes(text, "deploy-dev.bat"))

    def test_robocopy_exit_code_info(self):
        self.assertIn(("INFO", "robocopy-exit"), codes("robocopy a b /e\n", "c.bat"))
        self.assertNotIn(("INFO", "robocopy-exit"), codes("robocopy a b /e\nif %ERRORLEVEL% GEQ 8 exit /b 1\n", "c.bat"))


class DockerAndSettings(unittest.TestCase):
    def test_base_image_older_than_target_framework(self):
        text = "FROM mcr.microsoft.com/dotnet/aspnet:8.0\nRUN echo hi\n"
        self.assertIn(("WARN", "docker-base"), codes(text, "Dockerfile", tfm=10))
        self.assertNotIn(("WARN", "docker-base"), codes("FROM mcr.microsoft.com/dotnet/aspnet:10.0\n", "Dockerfile", tfm=10))

    def test_unpinned_and_pipe_shell(self):
        self.assertIn(("WARN", "docker-unpinned"), codes("FROM ubuntu:latest\n", "Dockerfile"))
        self.assertIn(("WARN", "docker-unpinned"), codes("RUN curl -L -o a.zip https://h/releases/latest/download/a.zip\n", "Dockerfile"))
        self.assertIn(("WARN", "docker-pipe-shell"), codes("RUN curl -fsSL https://h/get.sh | sh\n", "Dockerfile"))

    def test_multi_stage_alias_and_scratch_are_fine(self):
        text = "FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nFROM build AS final\n"
        self.assertEqual(codes(text, "Dockerfile", tfm=10), set())

    def test_settings_rules(self):
        self.assertIn(("WARN", "manage-key-empty"), codes('{"Deploy": {"ManagementKey": ""}}', "appsettings.json"))
        self.assertIn(("WARN", "dev-signin"), codes('{"AppSettings": {"IsEnabledDevAutoSignIn": true}}', "appsettings.json"))
        self.assertNotIn(("WARN", "manage-key-empty"), codes('{"Deploy": {"ManagementKey": "${DEPLOY_KEY}"}}', "appsettings.json"))


class Cli(unittest.TestCase):
    def test_cli_scans_folder_and_reports_exit_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "deploy.bat").write_text("handstack stop\n", encoding="utf-8")
            (root / "node_modules").mkdir()
            (root / "node_modules" / "skip.bat").write_text("handstack stop\n", encoding="utf-8")
            (root / "app.csproj").write_text("<Project><PropertyGroup><TargetFramework>net10.0</TargetFramework></PropertyGroup></Project>", encoding="utf-8")
            (root / "Dockerfile").write_text("FROM mcr.microsoft.com/dotnet/aspnet:8.0\n", encoding="utf-8")
            out, err = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                rc = p.main([str(root), "--fail-on", "WARN"])
            text = out.getvalue()
            self.assertEqual(rc, 1)
            self.assertIn("stop-all", text)
            self.assertIn("docker-base", text)
            self.assertNotIn("skip.bat", text)

    def test_unknown_rule_is_rejected(self):
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(p.main(["--disable", "nope", "."]), 2)


if __name__ == "__main__":
    unittest.main()
