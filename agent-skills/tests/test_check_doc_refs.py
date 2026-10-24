import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import check_doc_refs as c  # noqa: E402


class DocRefs(unittest.TestCase):
    def check(self, docs, bundle):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for base, files in (("docs", docs), ("bundle", bundle)):
                for name, text in files.items():
                    path = root / base / name
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text(text, encoding="utf-8")
            return c.check(root / "bundle", root / "docs")

    def test_existing_ids_pass(self):
        checked, errors = self.check(
            {"reference/거래-호출.mdx": "# a", "reference/api/index.mdx": "# i", "tutorial/a/b.mdx": "# b"},
            {"s/SKILL.md": "`reference/거래-호출` `reference/api` `reference/거래-호출#옵션` `tutorial/a/*`\n"})
        self.assertEqual((checked, errors), (4, []))

    def test_missing_id_is_reported_with_line(self):
        _, errors = self.check({"reference/a.mdx": "# a"}, {"s/SKILL.md": "x\n`reference/없음` 와 `reference/a`\n"})
        self.assertEqual(len(errors), 1)
        self.assertIn("s/SKILL.md:2", errors[0])
        self.assertIn("reference/없음", errors[0])

    def test_number_prefix_is_not_part_of_id(self):
        _, errors = self.check({"twelvefactor/5.빌드/개요.mdx": "# a"},
                               {"s/SKILL.md": "`twelvefactor/빌드/개요` `twelvefactor/빌드/*`\n"})
        self.assertEqual(errors, [])

    def test_frontmatter_id_and_url_form(self):
        _, errors = self.check({"guides/원본.mdx": "---\nid: 별칭\n---\n# a"},
                               {"s/SKILL.md": "https://handstack.kr/docs/guides/별칭 와 https://handstack.kr/docs/<id>\n"})
        self.assertEqual(errors, [])

    def test_bundle_local_path_and_non_doc_tokens_are_ignored(self):
        _, errors = self.check({"guides/a.mdx": "# a"},
                               {"guides/templates/x.md": "# x",
                                "s/SKILL.md": "`guides/templates/x.md` `src/app/Foo.cs` `a/b c` `./guides/z`\n"})
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
