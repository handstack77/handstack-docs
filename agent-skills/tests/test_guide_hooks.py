import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HOOKS = Path(__file__).resolve().parents[1] / "guides" / "templates" / "hooks"
sys.path.insert(0, str(HOOKS))
import deploy_gate as g  # noqa: E402
import protect_paths as pp  # noqa: E402


def run(script, payload, env=None):
    base = {k: v for k, v in os.environ.items() if k not in {"RELEASE_APPROVAL", "CLAUDE_PROJECT_DIR"}}
    base.update(env or {})
    return subprocess.run([sys.executable, "-B", str(HOOKS / script)], input=payload, text=True,
                          capture_output=True, env=base, encoding="utf-8")


class DeployGate(unittest.TestCase):
    def test_dangerous_commands_are_detected(self):
        for cmd in ("./publish.ps1 win publish Release x64", "pwsh -File publish.ps1", "handstack stop",
                    "handstack purgecontracts --ack=x", "rm -rf $HANDSTACK_HOME/modules",
                    "robocopy a b /mir", "rsync -a --delete a/ host:/b", "curl -X POST http://h/api/update-packages",
                    "docker compose down"):
            self.assertIsNotNone(g.check(cmd), cmd)

    def test_safe_commands_pass(self):
        for cmd in ("dotnet build -c Release", "handstack stop --port=8421", "robocopy a b /e", "git status",
                    "python hs_inspect.py --screen ABC010", "curl http://localhost:8421/checkip"):
            self.assertIsNone(g.check(cmd), cmd)

    def test_exit_codes_with_and_without_approval(self):
        payload = json.dumps({"tool_input": {"command": "handstack purgecontracts"}})
        blocked = run("deploy_gate.py", payload)
        self.assertEqual(blocked.returncode, 2)
        self.assertIn("RELEASE_APPROVAL", blocked.stderr)
        allowed = run("deploy_gate.py", payload, {"RELEASE_APPROVAL": "REL-1"})
        self.assertEqual(allowed.returncode, 0)

    def test_bad_input_does_not_block(self):
        self.assertEqual(run("deploy_gate.py", "not json").returncode, 0)


class ProtectPaths(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_defaults(self):
        for rel in (".env", "config/.env.local", "certs/site.pfx", "app/appsettings.Production.json",
                    "modules/x/bin/Debug/x.dll", "node_modules/a/index.js", "modules/x/wwwroot/x/lib/auigrid/a.js"):
            self.assertIsNotNone(pp.check(rel, self.root), rel)

    def test_ordinary_sources_pass(self):
        for rel in ("modules/x/wwwroot/x/view/ABC/ABC010.html", "modules/x/Contracts/transact/ABC/ABC010.txn",
                    "modules/x/Contracts/dbclient/ABC/ABC010.dbc", "appsettings.json"):
            self.assertIsNone(pp.check(rel, self.root), rel)

    def test_project_extra_patterns(self):
        (self.root / ".claude").mkdir()
        (self.root / ".claude" / "protected-paths.txt").write_text("# 동결\n*/v1/*\n", encoding="utf-8")
        self.assertIsNotNone(pp.check("src/v1/legacy.cs", self.root))
        self.assertIsNone(pp.check("src/v2/new.cs", self.root))

    def test_hook_blocks_with_exit_2(self):
        payload = json.dumps({"tool_input": {"file_path": str(self.root / ".env")}})
        result = run("protect_paths.py", payload, {"CLAUDE_PROJECT_DIR": str(self.root)})
        self.assertEqual(result.returncode, 2)
        self.assertIn("편집 차단", result.stderr)
        ok = json.dumps({"tool_input": {"file_path": str(self.root / "src" / "a.cs")}})
        self.assertEqual(run("protect_paths.py", ok, {"CLAUDE_PROJECT_DIR": str(self.root)}).returncode, 0)


if __name__ == "__main__":
    unittest.main()
