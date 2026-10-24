import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "skills" / "handstack-screen-development" / "scripts"))
import design_lint as d  # noqa: E402

GOOD = """<!DOCTYPE html><html><body style="visibility:hidden">
<form id="form1" syn-datafield="MainForm"><div class="page"><div class="page-wrapper">
<div class="page-header mt-2"><div class="container-fluid max-width:1600!"><h2 class="page-title">제목</h2></div></div>
<div class="page-body mt-2"><div class="container-fluid max-width:1600!">
<div class="card"><div class="card-status-top bg-dark-overlay"></div>
<label class="col-form-label required" for="txtName">이름</label><input id="txtName" syn-datafield="Name">
<button type="button" id="btnClose" class="btn btn-icon" aria-label="닫기"><i class="f:18 ti ti-x" aria-hidden="true"></i></button>
<syn_auigrid id="grdList" syn-datafield="DataList" syn-options="{columns: [['A','a',10,false,'text',false,'left','LD01']]}"></syn_auigrid>
</div></div></div></div></div></form><script src="/mod/js/syn.loader.js"></script></body></html>"""


def codes(html, name="ABC010.html", disabled=()):
    return {(f["severity"], f["rule"]) for f in d.lint(html, name, set(disabled))}


class LintTest(unittest.TestCase):
    def test_clean_screen_has_no_findings(self):
        self.assertEqual(codes(GOOD), set())

    def test_forbidden_icon_fonts_and_missing_classes(self):
        html = GOOD.replace('class="f:18 ti ti-x"', 'class="fa fa-times mr-2"')
        c = codes(html)
        self.assertIn(("ERROR", "icon-font"), c)
        self.assertIn(("ERROR", "missing-class"), c)

    def test_hex_and_inline_styles(self):
        c = codes(GOOD.replace('<h2 class="page-title">', '<h2 class="page-title" style="color:#ff0000;font-size:20px">'))
        self.assertIn(("ERROR", "hex-color"), c)
        c2 = codes(GOOD.replace('<h2 class="page-title">', '<h2 class="page-title" style="font-size:20px">'))
        self.assertIn(("WARN", "inline-style"), c2)
        self.assertEqual(codes(GOOD.replace('<h2 class="page-title">', '<h2 class="page-title" style="display:none">')), set())

    def test_popup_mix_and_container(self):
        html = GOOD.replace("</form>", '<div class="simplemodal-data"></div><div class="modal-dialog"></div></form>')
        self.assertIn(("ERROR", "popup-mix"), codes(html))
        self.assertIn(("WARN", "container"), codes(GOOD.replace("container-fluid max-width:1600!", "container-xl", 1)))

    def test_label_star_and_icon_button_label(self):
        self.assertIn(("WARN", "required-star"), codes(GOOD.replace(">이름</label>", ">이름 *</label>")))
        self.assertIn(("WARN", "icon-button-label"), codes(GOOD.replace(' aria-label="닫기"', "")))

    def test_unknown_syn_tag_and_duplicate_id(self):
        self.assertIn(("WARN", "unknown-syn"), codes(GOOD.replace("</div></div></div></div></div></form>", "<syn_combo id='cmb'></syn_combo></div></div></div></div></div></form>")))
        self.assertIn(("WARN", "id-duplicate"), codes(GOOD.replace('id="btnClose"', 'id="txtName"')))

    def test_comments_and_scripts_are_ignored(self):
        html = GOOD.replace("</body>", '<!-- <i class="fa fa-x"></i> --><script>var a = "<svg>";</script></body>')
        self.assertEqual(codes(html), set())

    def test_rule_can_be_disabled_and_rpt_skips_skeleton(self):
        html = GOOD.replace("container-fluid max-width:1600!", "container-xl", 1)
        self.assertNotIn(("WARN", "container"), codes(html, disabled=["container"]))
        self.assertNotIn(("WARN", "skeleton"), codes("<form syn-datafield='x'><script src='/syn.loader.js'></script>", "RPT010.html"))
        self.assertIn(("WARN", "skeleton"), codes("<form syn-datafield='x'><script src='/syn.loader.js'></script>", "ABC010.html"))

    def test_cli_exit_codes(self):
        with tempfile.TemporaryDirectory() as tmp, contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            f = Path(tmp) / "ABC010.html"
            f.write_text(GOOD.replace("ti ti-x", "fa fa-x"), encoding="utf-8")
            self.assertEqual(d.main([str(f), "--fail-on", "ERROR"]), 1)
            self.assertEqual(d.main([str(f), "--disable", "icon-font"]), 0)
            self.assertEqual(d.main([str(f), "--disable", "nope"]), 2)


if __name__ == "__main__":
    unittest.main()
