import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import validate_bundle as v  # noqa: E402


class BannedTerms(unittest.TestCase):
    def load(self, text):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "banned.txt"
            path.write_text(text, encoding="utf-8")
            return v.load_banned(path)

    def test_sections_and_default_scope(self):
        banned = self.load("# 주석\nlegacy\n[all]\nsecret-project\n[skills]\nproduct\n")
        self.assertEqual([p.pattern for p, _ in banned["all"]], ["secret-project"])
        # 구역 표시 앞의 항목과 구역이 없는 파일은 skills로 취급한다.
        self.assertEqual([p.pattern for p, _ in banned["skills"]], ["legacy", "product"])

    def test_except_clause(self):
        banned = self.load("[skills]\nproduct ;except=ide-skill, other-skill\nplain\n")
        (pattern, excepted), (_, plain_excepted) = banned["skills"]
        self.assertEqual(pattern.pattern, "product")
        self.assertEqual(excepted, {"ide-skill", "other-skill"})
        self.assertEqual(plain_excepted, set())

    def test_except_skill_is_allowed_others_are_reported(self):
        banned = self.load("[skills]\nproduct ;except=ide-skill\n")["skills"]
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "skills"
            for skill in ("ide-skill", "screen-skill"):
                (root / skill).mkdir(parents=True)
                (root / skill / "a.md").write_text("Product 이름", encoding="utf-8")
            errors = []
            v.check_text_files(sorted(root.rglob("a.md")), banned, errors, root)
        self.assertEqual(len(errors), 1)
        self.assertIn("screen-skill", errors[0])


class DocsScan(unittest.TestCase):
    def test_only_all_patterns_are_checked_in_docs(self):
        with tempfile.TemporaryDirectory() as tmp:
            banned_file = Path(tmp) / "banned.txt"
            banned_file.write_text("[all]\nsecret-project\n[skills]\ncompany\n", encoding="utf-8")
            loaded = v.load_banned(banned_file)
            docs = Path(tmp) / "docs"
            docs.mkdir()
            # docs 검사는 비밀 값 패턴을 보지 않는다(검증기가 이 파일을 오탐하지 않도록 조각으로 나눈다).
            sample_secret = "pass" "word = " "abcdefghijklmnop1234"
            (docs / "ok.mdx").write_text(f"company 주소와 {sample_secret}", encoding="utf-8")
            (docs / "bad.md").write_text("Secret-Project 소개", encoding="utf-8")
            errors = []
            v.check_docs(docs, loaded["all"], errors)
        self.assertEqual(len(errors), 1)
        self.assertIn("bad.md", errors[0])


if __name__ == "__main__":
    unittest.main()
