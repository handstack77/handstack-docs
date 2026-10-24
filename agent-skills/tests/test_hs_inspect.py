import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "skills" / "handstack-source-trace" / "scripts"))
import hs_inspect as h  # noqa: E402

HTML = """<!DOCTYPE html>
<html><body style="visibility: hidden;">
<form autocomplete="off" id="form1" syn-datafield="MainForm">
  <input type="text" id="txtName" syn-datafield="Name" syn-options="{belongID: ['LD01']}">
  <input type="hidden" id="hdnUser" syn-datafield="UserNo" syn-options="{belongID: ['LD01', 'MD01']}">
  <button type="button" id="btnSearch" syn-events="['click']">조회</button>
  <button type="button" id="btnAdd" syn-events="['click']" syn-options="{triggerConfig: {triggerEvent: 'click', triggerID: 'grdList', action: 'syn.uicontrols.$auigrid.insertRow'}}">+</button>
  <syn_auigrid id="grdList" syn-datafield="DataList" syn-options="{columns: [
    ['Code', '코드', 80, false, 'text', true, 'left', ['MD01'], {maxlength: 10}],
    ['Title', '제목', 120, false, 'text', false, 'left', 'MD01']
  ]}" syn-events="['afterSelectionEnd']"></syn_auigrid>
</form>
<syn_data id="srcException" syn-options="{dataSourceID: 'Exception', storeType: 'Form', columns: [{data: 'Error', dataType: 'string'}]}"></syn_data>
<script src="/mod/js/syn.loader.js"></script>
</body></html>"""

JS = """'use strict';
let $ABC010 = {
    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'DataList' }]
        },
        MD01: {
            inputs: [{ type: 'List', dataFieldID: 'DataList' }],
            outputs: [{ type: 'Form', dataFieldID: 'Exception' }],
            callback: (error, response) => { }
        }
    },
    hook: {
        pageLoad() { $this.method.search(); },
        afterTransaction(error, functionID, responseData) {
            if (functionID == 'LD01') { }
        }
    },
    event: {
        btnSearch_click() { $this.method.search(); },
        grdList_afterSelectionEnd(elID, rowIndex) { }
    },
    method: {
        search() { syn.$w.transactionAction('LD01'); },
        remove() { syn.$w.transactionAction('DD99'); }
    }
}
"""

TXN = """{
    // 주석과 후행 쉼표 허용
    "ApplicationID": "HDS",
    "ProjectID": "ABC",
    "TransactionID": "ABC010",
    "Services": [
        { "ServiceID": "LD01", "CommandType": "D", "ReturnType": "Json", "Inputs": [], "Outputs": [], },
        { "ServiceID": "MD01", "CommandType": "D", "ReturnType": "Json", "Inputs": [], "Outputs": [], },
        { "ServiceID": "ZZ01", "CommandType": "D", "ReturnType": "Json", "Inputs": [], "Outputs": [], },
    ],
    "Models": [],
}"""

DBC = """<?xml version="1.0" encoding="UTF-8"?>
<mapper xmlns="contract.xsd">
  <header><application>HDS</application><project>ABC</project><transaction>ABC010</transaction><datasource>DB01</datasource><use>Y</use><desc></desc></header>
  <commands>
    <statement id="LD01" seq="0"><![CDATA[SELECT * FROM T WHERE Name = @Name AND UserNo = @UserNo]]>
      <param id="@Name" type="String" length="50" value="NULL" />
      <param id="@UserNo" type="String" length="32" value="NULL" />
      <param id="@Missing" type="String" length="10" value="NULL" />
    </statement>
    <statement id="MD01" seq="0"><if test="(Flag == 'C')"><![CDATA[INSERT INTO T VALUES (@Code, @Title)]]></if>
      <param id="@Code" type="String" length="10" value="NULL" />
      <param id="@Title" type="String" length="10" value="NULL" />
    </statement>
  </commands>
</mapper>"""


def make_tree(root: Path, *, html=HTML, js=JS, txn=TXN, dbc=DBC, module="modx"):
    view = root / module / "wwwroot" / module / "view" / "HDS" / "ABC"
    view.mkdir(parents=True)
    (view / "ABC010.html").write_text(html, encoding="utf-8")
    if js is not None:
        (view / "ABC010.js").write_text(js, encoding="utf-8")
    for kind, ext, body in (("transact", "txn", txn), ("dbclient", "dbc", dbc)):
        if body is not None:
            d = root / module / "Contracts" / kind / "HDS" / "ABC"
            d.mkdir(parents=True)
            (d / f"ABC010.{ext}").write_text(body, encoding="utf-8")


def run(root):
    screens, contracts = h.collect([root])
    key = next(k for k in screens if k[2] == "ABC010")
    return h.analyze_screen(key, screens[key], contracts)


def codes(result):
    return {(f["severity"], f["code"]) for f in result["findings"]}


class JsoncTest(unittest.TestCase):
    def test_comments_and_trailing_commas_keep_urls(self):
        data = h.parse_jsonc('{"a": "http://x//y", /* c */ "b": [1, 2,], // tail\n}')
        self.assertEqual(data, {"a": "http://x//y", "b": [1, 2]})

    def test_unterminated_block_comment_is_error(self):
        with self.assertRaises(ValueError):
            h.parse_jsonc('{"a": 1 /* open')


class ParserTest(unittest.TestCase):
    def test_grid_columns_tuple_belong_index(self):
        cols = h.grid_columns("{columns: [['A','a',10,false,'text',true,'left',['LD02','MD01'],{x:1}],['B','b',10,false,'text',false,'left','MD01']]}")
        self.assertEqual(cols, [{"field": "A", "belong": ["LD02", "MD01"]}, {"field": "B", "belong": ["MD01"]}])

    def test_top_keys_ignore_nested_names(self):
        keys = h.top_keys("a: 1, b() { if (x) { c(); } }, async d(e) { return f(); }, g: { h: 2 }")
        self.assertEqual(keys, ["a", "b", "d", "g"])


class TraceTest(unittest.TestCase):
    def test_clean_mapping_and_expected_findings(self):
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp))
            res = run(Path(tmp))
            tx = res["transactions"]
            self.assertEqual(tx["LD01"]["inputs"][0]["fields"], ["Name", "UserNo"])
            self.assertEqual(tx["MD01"]["inputs"][0]["fields"], ["Code", "Title"])
            self.assertEqual(tx["MD01"]["sql"][0]["seq"], ["0"])
            c = codes(res)
            self.assertIn(("WARN", "ACTION_UNDEFINED"), c)
            self.assertIn(("INFO", "PARAM_NOT_SENT"), c)
            self.assertIn(("INFO", "SERVICE_UNUSED"), c)
            self.assertNotIn(("ERROR", "OUTPUT_TARGET"), c)
            self.assertFalse([f for f in res["findings"] if f["code"] == "EVENT_HANDLER" and "btnAdd" in f["message"]])

    def test_missing_output_target_and_statement(self):
        js = JS.replace("dataFieldID: 'Exception'", "dataFieldID: 'Nowhere'")
        dbc = DBC.replace('<statement id="MD01"', '<statement id="MD09"')
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp), js=js, dbc=dbc)
            c = codes(run(Path(tmp)))
            self.assertIn(("ERROR", "OUTPUT_TARGET"), c)
            self.assertIn(("ERROR", "NO_STATEMENT"), c)

    def test_explicit_contract_counts_must_match(self):
        txn = TXN.replace('"ServiceID": "LD01", "CommandType": "D", "ReturnType": "Json", "Inputs": [],',
                          '"ServiceID": "LD01", "CommandType": "D", "ReturnType": "Json", "Inputs": [{"Type":"Row"},{"Type":"List"}],')
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp), txn=txn)
            self.assertIn(("ERROR", "INPUT_COUNT"), codes(run(Path(tmp))))

    def test_missing_service_when_txn_exists(self):
        txn = TXN.replace('"ServiceID": "MD01"', '"ServiceID": "MD77"')
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp), txn=txn)
            self.assertIn(("ERROR", "NO_SERVICE"), codes(run(Path(tmp))))

    def test_broken_txn_reports_parse_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp), txn='{"Services": [ {')
            self.assertIn(("ERROR", "TXN_PARSE"), codes(run(Path(tmp))))

    def test_excluded_directories_are_ignored(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            make_tree(root)
            make_tree(root / "modx" / "bin" / "Debug", module="copy")
            screens, contracts = h.collect([root])
            self.assertEqual(len([k for k in screens if k[2] == "ABC010"]), 1)
            self.assertEqual(len(contracts), 2)

    def test_same_id_in_two_modules_is_listed_separately(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            make_tree(root, module="moda")
            make_tree(root, module="modb")
            screens, _ = h.collect([root])
            self.assertEqual(sorted(k[0] for k in screens if k[2] == "ABC010"), ["moda", "modb"])

    def test_event_handler_without_declaration_is_info_only(self):
        js = JS.replace("btnSearch_click() {", "txtName_change() { }, btnSearch_click() {")
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp), js=js)
            self.assertIn(("INFO", "EVENT_NOT_DECLARED"), codes(run(Path(tmp))))

    def test_server_injected_variables_are_not_reported_as_unsent(self):
        dbc = DBC.replace('<param id="@Missing" type="String" length="10" value="NULL" />', '<param id="@$CompanyNo" type="String" length="10" value="NULL" />')
        with tempfile.TemporaryDirectory() as tmp:
            make_tree(Path(tmp), dbc=dbc)
            res = run(Path(tmp))
            joined = " ".join(f["message"] for f in res["findings"])
            self.assertNotIn("companyno", joined.lower())

    def test_settings_files_are_never_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            make_tree(root)
            (root / "modx" / "module.json").write_text('{"ConnectionString": "Server=secret;Password=hunter2"}', encoding="utf-8")
            res = run(root)
            self.assertNotIn("hunter2", json.dumps(res, ensure_ascii=False))


WORKFLOW_TXN = """{
    "ApplicationID": "HDS", "ProjectID": "ABC", "TransactionID": "ABC010",
    "Services": [
        { "ServiceID": "LD01", "CommandType": "D", "ReturnType": "Json", "Inputs": [], "Outputs": [] },
        { "ServiceID": "GW01", "CommandType": "W", "ReturnType": "Json", "Inputs": [], "Outputs": [],
          "WorkflowSteps": [
            { "StepID": "first", "CommandType": "D", "TransactionProjectID": "ABC", "TransactionID": "ABC010", "ServiceID": "LD01",
              "Assertions": [ { "Assert": "NotEmpty", "Collection": { "Source": "Step", "FieldID": "X" } } ] },
            { "StepID": "second", "CommandType": "D", "TransactionProjectID": "ABC", "TransactionID": "ABC010", "ServiceID": "NOPE",
              "InputMappings": [ { "SourceStepID": "ghost", "SourceFieldID": "X" } ],
              "Assertions": [ { "Assert": "Bogus" } ] },
            { "StepID": "third", "CommandType": "D", "TransactionProjectID": "ABC", "TransactionID": "ABC010", "ServiceID": "GONE",
              "Assertions": [ { "Assert": "Throws" } ] }
          ] },
        { "ServiceID": "GW02", "CommandType": "W", "ReturnType": "Json", "Inputs": [], "Outputs": [], "WorkflowSteps": [] }
    ]
}"""


class WorkflowTest(unittest.TestCase):
    def test_workflow_steps_are_checked(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            d = root / "modx" / "Contracts" / "transact" / "HDS" / "ABC"
            d.mkdir(parents=True)
            (d / "ABC010.txn").write_text(WORKFLOW_TXN, encoding="utf-8")
            screens, contracts = h.collect([root])
            res = h.analyze_screen(("modx", "ABC", "ABC010"), {"html": [], "js": []}, contracts)
            by_code = {}
            for f in res["findings"]:
                by_code.setdefault(f["code"], []).append(f)
            self.assertIn("CONTRACT_ONLY", by_code)
            self.assertEqual([f["severity"] for f in by_code["WORKFLOW_SERVICE"] if "NOPE" in f["message"]], ["ERROR"])
            self.assertEqual([f["severity"] for f in by_code["WORKFLOW_SERVICE"] if "GONE" in f["message"]], ["INFO"])
            self.assertTrue(any("ghost" in f["message"] for f in by_code["WORKFLOW_SOURCE_STEP"]))
            self.assertTrue(any("Bogus" in f["message"] for f in by_code["WORKFLOW_ASSERT"]))
            self.assertTrue(any("GW02" in f["message"] for f in by_code["WORKFLOW_EMPTY"]))


class CliTest(unittest.TestCase):
    def test_fail_on_and_bad_root(self):
        import contextlib
        import io
        with tempfile.TemporaryDirectory() as tmp, contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            make_tree(Path(tmp), dbc=DBC.replace('<statement id="MD01"', '<statement id="MD09"'))
            self.assertEqual(h.main(["--root", tmp, "--screen", "ABC010", "--fail-on", "ERROR"]), 1)
            self.assertEqual(h.main(["--root", tmp, "--screen", "ABC010"]), 0)
            self.assertEqual(h.main(["--root", str(Path(tmp) / "none"), "--list"]), 2)


if __name__ == "__main__":
    unittest.main()
