import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import validate_bundle as v  # noqa: E402


class GuideLinks(unittest.TestCase):
    def check(self, files):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name, text in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text, encoding="utf-8")
            errors = []
            v.check_guides(root, errors)
            return errors

    def test_valid_links_and_anchors_pass(self):
        errors = self.check({
            "a.md": "# 제목\n## 5. 안전장치: 훅과 보호 경로\n[b](b.md) [앵커](b.md#2-두-번째) [내부](#5-안전장치-훅과-보호-경로)\n",
            "b.md": "# B\n## 2. 두 번째\n",
        })
        self.assertEqual(errors, [])

    def test_missing_file_and_anchor_are_reported(self):
        errors = self.check({"a.md": "# A\n[x](nope.md) [y](b.md#없는-앵커) [외부](https://example.com/x)\n", "b.md": "# B\n"})
        self.assertEqual(len(errors), 2)
        self.assertTrue(any("링크 대상 없음" in e for e in errors))
        self.assertTrue(any("앵커 없음" in e for e in errors))

    def test_links_inside_code_fences_are_ignored(self):
        errors = self.check({"a.md": "# A\n```\n[x](nope.md)\n```\n"})
        self.assertEqual(errors, [])

    def test_python_syntax_error_in_template_script(self):
        errors = self.check({"t/x.py": "def broken(:\n"})
        self.assertEqual(len(errors), 1)


if __name__ == "__main__":
    unittest.main()
