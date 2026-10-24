#!/usr/bin/env python3
"""HandStack 화면-계약 흐름 점검기 (읽기 전용, Python 3.10+, 표준 라이브러리만 사용).

화면(HTML/JS)과 계약(.txn/.dbc/.fnc 등)을 정적으로 읽어 화면 ID 단위로
"이벤트 -> 거래 -> 서비스 -> SQL/함수" 연결표와 불일치 후보를 출력한다.
파일을 수정하거나 코드·SQL·HTTP를 실행하지 않으며 설정 파일(module.json 등)은 읽지 않는다.
JS/HTML 해석은 정규식 기반의 근사치이므로 결과는 확인 대상 후보로 취급한다.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

EXCLUDED_DIRS = {"node_modules", "bin", "obj", ".git", ".vs", "lib", "libs", "vendor", "dist", "publish", "__pycache__"}
CONTRACT_EXT = {".txn": "transact", ".dbc": "dbclient", ".fnc": "function", ".bas": "command",
                ".cyp": "graphclient", ".pmt": "prompter", ".rpo": "repository"}
CONTRACT_DIRS = {"transact", "dbclient", "function", "command", "graphclient", "prompter", "repository"}
ID_PREFIX = {
    "button": ("btn",), "a": ("btn",), "select": ("ddl",), "textarea": ("txt",),
    "syn_auigrid": ("grd",), "syn_grid": ("grd",), "syn_chart": ("cht",), "syn_chartjs": ("cht",),
    "syn_codepicker": ("chp",), "syn_datepicker": ("dtp",), "syn_dateperiodpicker": ("dtp",),
    "syn_htmleditor": ("edt", "txt"), "syn_sourceeditor": ("edt", "txt"), "syn_tree": ("tvl",),
    "syn_data": ("src",), "syn_list": ("lst",), "syn_organization": ("org",),
    "syn_filedropzone": ("fdz",), "syn_signaturepad": ("sig",), "syn_contextmenu": ("ctx",),
}
INPUT_PREFIX = {"hidden": ("hdn",), "text": ("txt",), "search": ("txt",), "password": ("pin",),
                "checkbox": ("chk",), "radio": ("rdo",), "number": ("num",), "email": ("eml",),
                "tel": ("tel",), "url": ("url",), "color": ("clr",), "button": ("btn",),
                "submit": ("smt",), "reset": ("rst",)}
GRID_TAGS = {"syn_auigrid", "syn_grid", "syn_list", "syn_chart", "syn_chartjs"}
IMPLICIT_PARAMS = {"flag"}
WORKFLOW_ASSERTS = {"EQUAL", "NOTEQUAL", "TRUE", "FALSE", "NULL", "NOTNULL", "CONTAINS", "DOESNOTCONTAIN", "EMPTY", "NOTEMPTY", "SINGLE", "INRANGE", "THROWS", "ISTYPE", "SAME"}


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    for enc in (("utf-16",) if raw.startswith((b"\xff\xfe", b"\xfe\xff")) else ("utf-8-sig", "cp949")):
        try:
            return raw.decode(enc)
        except UnicodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def parse_jsonc(text: str):
    """주석과 후행 쉼표를 허용하는 JSON 해석. 문자열 안의 // 와 , 는 보존한다."""
    out, i, n, quoted = [], 0, len(text), False
    while i < n:
        c = text[i]
        if quoted:
            out.append(c)
            if c == "\\" and i + 1 < n:
                i += 1
                out.append(text[i])
            elif c == '"':
                quoted = False
        elif c == '"':
            quoted = True
            out.append(c)
        elif text.startswith("//", i):
            j = text.find("\n", i)
            i = n if j < 0 else j
            continue
        elif text.startswith("/*", i):
            j = text.find("*/", i + 2)
            if j < 0:
                raise ValueError("닫히지 않은 블록 주석")
            out.append(" ")
            i = j + 2
            continue
        else:
            out.append(c)
        i += 1
    cleaned = "".join(out)
    res, i, n, quoted = [], 0, len(cleaned), False
    while i < n:
        c = cleaned[i]
        if quoted:
            res.append(c)
            if c == "\\" and i + 1 < n:
                i += 1
                res.append(cleaned[i])
            elif c == '"':
                quoted = False
        elif c == '"':
            quoted = True
            res.append(c)
        elif c == ",":
            j = i + 1
            while j < n and cleaned[j].isspace():
                j += 1
            if j < n and cleaned[j] in "}]":
                i += 1
                continue
            res.append(c)
        else:
            res.append(c)
        i += 1
    return json.loads("".join(res))


def balanced(text: str, start: int, open_ch: str, close_ch: str):
    """text[start]가 open_ch일 때 짝이 맞는 닫는 위치까지(포함)를 반환. 문자열·주석을 건너뛴다."""
    depth, i, n = 0, start, len(text)
    while i < n:
        c = text[i]
        if c in "'\"`":
            q = c
            i += 1
            while i < n and text[i] != q:
                i += 2 if text[i] == "\\" else 1
        elif text.startswith("//", i):
            j = text.find("\n", i)
            i = n if j < 0 else j
            continue
        elif text.startswith("/*", i):
            j = text.find("*/", i + 2)
            i = n if j < 0 else j + 1
        elif c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return start, i
        i += 1
    return None


def split_top(text: str):
    """최상위 쉼표로 분리. 문자열과 괄호 내부는 건너뛴다."""
    parts, depth, cur, i, n = [], 0, [], 0, len(text)
    while i < n:
        c = text[i]
        if c in "'\"`":
            q = c
            cur.append(c)
            i += 1
            while i < n and text[i] != q:
                if text[i] == "\\":
                    cur.append(text[i])
                    i += 1
                cur.append(text[i])
                i += 1
            cur.append(q)
        elif c in "[{(":
            depth += 1
            cur.append(c)
        elif c in "]})":
            depth -= 1
            cur.append(c)
        elif c == "," and depth == 0:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(c)
        i += 1
    if "".join(cur).strip():
        parts.append("".join(cur))
    return parts


def literal_strings(text: str):
    return re.findall(r"""['"]([^'"]*)['"]""", text)


def belong_ids(text: str | None):
    if not text:
        return []
    m = re.search(r"""belongID\s*:\s*(\[[^\]]*\]|'[^']*'|"[^"]*")""", text)
    return literal_strings(m.group(1)) if m else []


class ScreenHtml(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.forms, self.controls, self.stores, self.ids = [], [], [], []
        self.scripts, self.events, self.form_stack = [], [], []
        self.body_style = None

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "body":
            self.body_style = a.get("style", "")
        if tag == "script" and a.get("src"):
            self.scripts.append(a["src"])
        if tag == "form":
            self.form_stack.append(a.get("syn-datafield") or None)
            if a.get("syn-datafield"):
                self.forms.append(a["syn-datafield"])
        if a.get("id"):
            self.ids.append((a["id"], tag, a.get("type", "")))
        has_df = "syn-datafield" in a
        has_events = "syn-events" in a
        opts = a.get("syn-options", "")
        if tag == "syn_data":
            self.stores.append(self._store(a, opts))
        elif has_df or has_events or "syn-options" in a:
            ctl = {"id": a.get("id", ""), "tag": tag, "type": a.get("type", ""),
                   "field": a.get("syn-datafield", ""), "form": next((f for f in reversed(self.form_stack) if f), ""),
                   "belong": belong_ids(opts), "has_datafield": has_df, "options": opts}
            if tag in GRID_TAGS:
                ctl["columns"] = grid_columns(opts)
            self.controls.append(ctl)
        for ev in re.findall(r"""['"](\w+)['"]""", a.get("syn-events", "")):
            self.events.append((a.get("id", ""), ev))

    def handle_endtag(self, tag):
        if tag == "form" and self.form_stack:
            self.form_stack.pop()

    @staticmethod
    def _store(a, opts):
        sid = re.search(r"""dataSourceID\s*:\s*['"](\w+)['"]""", opts)
        st = re.search(r"""storeType\s*:\s*['"](\w+)['"]""", opts)
        cols = []
        m = re.search(r"columns\s*:\s*\[", opts)
        if m:
            span = balanced(opts, m.end() - 1, "[", "]")
            if span:
                for obj in re.findall(r"\{[^{}]*\}", opts[span[0]:span[1] + 1]):
                    d = re.search(r"""data\s*:\s*['"](\w+)['"]""", obj)
                    if d:
                        cols.append({"field": d.group(1), "belong": belong_ids(obj)})
        return {"id": a.get("id", ""), "source": sid.group(1) if sid else "", "type": st.group(1) if st else "", "columns": cols}


def grid_columns(opts: str):
    """columns 배열의 튜플 [필드, 헤더, 너비, 숨김, 형식, 읽기전용, 정렬, belongID, {옵션}]을 해석."""
    m = re.search(r"columns\s*:\s*\[", opts)
    if not m:
        return []
    span = balanced(opts, m.end() - 1, "[", "]")
    if not span:
        return []
    body = opts[span[0] + 1:span[1]]
    cols = []
    for item in split_top(body):
        item = item.strip()
        if item.startswith("["):
            parts = split_top(item[1:-1])
            if parts:
                field = (literal_strings(parts[0]) or [""])[0]
                belong = literal_strings(parts[7]) if len(parts) > 7 else []
                cols.append({"field": field, "belong": belong})
        elif item.startswith("{"):
            d = re.search(r"""(?:dataField|data)\s*:\s*['"](\w+)['"]""", item)
            if d:
                cols.append({"field": d.group(1), "belong": belong_ids(item)})
    return cols


def top_keys(block: str):
    """객체 본문의 최상위 키(속성 또는 메서드) 이름 목록."""
    keys, depth, i, n = [], 0, 0, len(block)
    while i < n:
        c = block[i]
        if c in "'\"`":
            q = c
            i += 1
            while i < n and block[i] != q:
                i += 2 if block[i] == "\\" else 1
        elif block.startswith("//", i):
            j = block.find("\n", i)
            i = n if j < 0 else j
            continue
        elif block.startswith("/*", i):
            j = block.find("*/", i + 2)
            i = n if j < 0 else j + 1
        elif c in "{[(":
            depth += 1
        elif c in "}])":
            depth -= 1
        elif depth == 0 and (c.isalpha() or c in "_$") and (i == 0 or not (block[i - 1].isalnum() or block[i - 1] in "_$")):
            m = re.match(r"(?:async\s+)?([A-Za-z_$][\w$]*)\s*(?::|\()", block[i:])
            if m:
                keys.append(m.group(1))
                i += len(m.group(0)) - len(m.group(0).lstrip()) + m.group(0).index(m.group(1)) + len(m.group(1)) - 1
        i += 1
    return keys


def object_block(text: str, key: str, within: str | None = None):
    src = within if within is not None else text
    for m in re.finditer(r"(?<![\w$.])" + re.escape(key) + r"\s*:\s*\{", src):
        span = balanced(src, m.end() - 1, "{", "}")
        if span:
            return src[span[0] + 1:span[1]]
    return None


def parse_js(text: str, stem: str):
    info = {"object": None, "hooks": [], "events": [], "transactions": {}, "actions": [], "directs": [], "methods": []}
    m = re.search(r"^\s*(?:let|var|const)\s+\$(\w+)\s*=\s*\{", text, re.M)
    if not m:
        return info
    info["object"] = m.group(1)
    span = balanced(text, m.end() - 1, "{", "}")
    body = text[span[0] + 1:span[1]] if span else text[m.end():]
    top = set(top_keys(body))
    hook = object_block(body, "hook") if "hook" in top else None
    event = object_block(body, "event") if "event" in top else None
    method = object_block(body, "method") if "method" in top else None
    trans = object_block(body, "transaction") if "transaction" in top else None
    info["hooks"] = top_keys(hook) if hook else []
    info["events"] = top_keys(event) if event else []
    info["methods"] = top_keys(method) if method else []
    if trans:
        for key in top_keys(trans):
            blk = object_block(trans, key)
            if blk is None:
                continue
            tx = {"inputs": [], "outputs": [], "callback": bool(re.search(r"\bcallback\s*:", blk))}
            for kind in ("inputs", "outputs"):
                mm = re.search(kind + r"\s*:\s*\[", blk)
                if mm:
                    sp = balanced(blk, mm.end() - 1, "[", "]")
                    for obj in re.findall(r"\{[^{}]*\}", blk[sp[0]:sp[1] + 1] if sp else ""):
                        t = re.search(r"""type\s*:\s*['"](\w+)['"]""", obj)
                        d = re.search(r"""dataFieldID\s*:\s*['"](\w+)['"]""", obj)
                        tx[kind].append({"type": t.group(1) if t else "", "dataFieldID": d.group(1) if d else ""})
            fid = re.search(r"""functionID\s*:\s*['"](\w+)['"]""", blk)
            tx["functionID"] = fid.group(1) if fid else key
            info["transactions"][key] = tx
    info["actions"] = sorted(set(re.findall(r"""transactionAction\(\s*['"](\w+)['"]""", text)))
    for m2 in re.finditer(r"transactionDirect\(\s*\{", text):
        sp = balanced(text, m2.end() - 1, "{", "}")
        blk = text[sp[0]:sp[1] + 1] if sp else ""
        d = {}
        for k in ("programID", "businessID", "transactionID", "functionID"):
            mm = re.search(k + r"""\s*:\s*(['"]([^'"]*)['"]|[^,\n}]+)""", blk)
            if mm:
                d[k] = mm.group(2) if mm.group(2) is not None else "<동적:" + mm.group(1).strip() + ">"
        info["directs"].append(d)
    return info


def parse_contract(path: Path, kind: str):
    text = read_text(path)
    rec = {"kind": kind, "path": str(path), "error": None}
    try:
        if kind == "transact":
            d = parse_jsonc(text)
            rec.update(project=d.get("ProjectID"), transaction=d.get("TransactionID"), application=d.get("ApplicationID"),
                       top_project=d.get("TransactionProjectID"),
                       services={s.get("ServiceID"): s for s in d.get("Services", []) if isinstance(s, dict)})
        elif kind == "repository":
            rec["items"] = len(parse_jsonc(text))
        else:
            xml = text.split("?>", 1)[1] if text.lstrip().startswith("<?xml") else text
            root = ET.fromstring(xml.encode("utf-8"))
            ns = ""
            if root.tag.startswith("{"):
                ns = root.tag[:root.tag.index("}") + 1]
            h = root.find(ns + "header")
            get = (lambda t: (h.findtext(ns + t) or "").strip()) if h is not None else (lambda t: "")
            rec.update(application=get("application"), project=get("project"), transaction=get("transaction"),
                       datasource=get("datasource"), language=get("language"))
            items = defaultdict(list)
            seen, dups = set(), []
            for group in root:
                gname = group.tag.replace(ns, "")
                if gname not in ("commands", "prompts", "requests"):
                    continue
                for st in group:
                    sid = st.get("id")
                    if not sid:
                        continue
                    strip = "@$" if kind in ("graphclient", "prompter", "command") else "@"
                    params = [(p.get("id") or "").lstrip(strip) if strip == "@$" else (p.get("id") or "")[1:] if (p.get("id") or "").startswith("@") else (p.get("id") or "")
                              for p in st.iter(ns + "param")]
                    items[sid].append({"seq": st.get("seq", "0"), "params": params, "use": st.get("use", "Y")})
                    key = (sid, st.get("seq", "0"))
                    if key in seen:
                        dups.append(key)
                    seen.add(key)
            rec["items"] = dict(items)
            rec["duplicates"] = dups
    except Exception as exc:  # noqa: BLE001
        rec["error"] = f"{type(exc).__name__}: {exc}"
    return rec


def contract_kind(path: Path):
    ext = path.suffix.lower()
    if ext in CONTRACT_EXT:
        return CONTRACT_EXT[ext]
    if ext in (".json", ".xml"):
        parts = {p.lower() for p in path.parts}
        for d in CONTRACT_DIRS:
            if d in parts and "contracts" in parts:
                if (d == "transact") == (ext == ".json") or d == "repository":
                    return d
    return None


def walk(roots):
    for root in roots:
        for p in sorted(Path(root).rglob("*")):
            if any(part in EXCLUDED_DIRS for part in p.relative_to(root).parts[:-1]):
                continue
            if p.is_file():
                yield Path(root), p


def project_hint(path: Path):
    parts = path.parts
    lowered = [x.lower() for x in parts]
    for marker in ("view", "wwwroot"):
        if marker in lowered:
            idx = len(lowered) - 1 - lowered[::-1].index(marker)
            rest = parts[idx + 1:-1]
            if rest:
                return rest[-1]
    for d in CONTRACT_DIRS:
        if d in lowered:
            idx = lowered.index(d)
            rest = parts[idx + 1:-1]
            if rest:
                return rest[-1]
    return ""


def module_hint(root: Path, path: Path):
    rel = path.relative_to(root).parts
    return rel[0] if len(rel) > 1 else root.name


def collect(roots):
    screens = defaultdict(lambda: {"html": [], "js": []})
    contracts = []
    for root, p in walk(roots):
        ext = p.suffix.lower()
        mod = module_hint(root, p)
        if ext in (".html", ".js") and "view" in [x.lower() for x in p.parts]:
            screens[(mod, project_hint(p), p.stem)][ext[1:]].append(p)
        else:
            kind = contract_kind(p)
            if kind:
                rec = parse_contract(p, kind)
                rec["module"] = mod
                rec["stem"] = p.stem
                rec["project_dir"] = project_hint(p)
                contracts.append(rec)
    return screens, contracts


def analyze_screen(key, files, contracts):
    mod, proj, sid = key
    out = {"module": mod, "projectDir": proj, "screen": sid, "findings": [], "transactions": {}, "files": {}}
    def add(sev, code, msg):
        item = {"severity": sev, "code": code, "message": msg}
        if item not in out["findings"]:
            out["findings"].append(item)
    html_text = read_text(files["html"][0]) if files["html"] else None
    js_text = read_text(files["js"][0]) if files["js"] else None
    out["files"] = {"html": [str(p) for p in files["html"]], "js": [str(p) for p in files["js"]]}
    if not files["html"] and not files["js"]:
        add("INFO", "CONTRACT_ONLY", "화면 파일 없이 계약만 점검한다(워크플로·API 전용 거래일 수 있음)")
    else:
        if not files["html"]:
            add("INFO", "NO_HTML", "짝이 되는 HTML이 없다(JS 단독 모듈일 수 있음)")
        if not files["js"]:
            add("INFO", "NO_JS", "짝이 되는 JS가 없다(팝업 조각이면 정상일 수 있음)")
    page = ScreenHtml()
    if html_text:
        page.feed(html_text)
    js = parse_js(js_text, sid) if js_text else {"object": None, "hooks": [], "events": [], "transactions": {}, "actions": [], "directs": [], "methods": []}
    if js_text and js["object"] and js["object"] != sid:
        add("WARN", "OBJECT_NAME", f"JS 객체 ${js['object']}가 파일명 {sid}와 다르다")
    if js_text and not js["object"]:
        add("WARN", "NO_OBJECT", "`let $화면ID = {` 형태의 화면 객체를 찾지 못했다")
    dup = [i for i in {x[0] for x in page.ids} if [x[0] for x in page.ids].count(i) > 1]
    for i in dup:
        add("WARN", "DUP_ID", f"HTML id '{i}'가 중복되었다")
    for cid, tag, typ in page.ids:
        pref = ID_PREFIX.get(tag) or (INPUT_PREFIX.get(typ or "text") if tag == "input" else None)
        if pref and not any(cid.startswith(p) for p in pref):
            add("INFO", "ID_PREFIX", f"id '{cid}' ({tag}) 접두어 관례({'/'.join(pref)}) 확인")
    trigger_ids = {c["id"] for c in page.controls if "triggerConfig" in c["options"] or "transactConfig" in c["options"]}
    for cid, ev in page.events:
        if cid and cid not in trigger_ids and f"{cid}_{ev}" not in js["events"] and js_text is not None:
            add("INFO", "EVENT_HANDLER", f"syn-events의 {cid}.{ev}에 대응하는 event.{cid}_{ev} 핸들러가 없다(선언만 있고 동작 없음)")
    declared = {(c, e) for c, e in page.events}
    html_ids = {i[0] for i in page.ids}
    for name in js["events"]:
        cid, _, ev = name.rpartition("_")
        if cid in html_ids and cid not in trigger_ids and (cid, ev) not in declared and ev not in ("callback",):
            add("INFO", "EVENT_NOT_DECLARED", f"event.{name} 핸들러가 있으나 {cid}의 syn-events에 '{ev}'가 없다. 새로 만든 핸들러라면 선언을 추가한다(다른 컨트롤의 triggerConfig가 호출하는 경우는 정상)")

    cands = [c for c in contracts if c["kind"] == "transact" and (c.get("transaction") == sid or c["stem"] == sid)
             and c["module"] == mod]
    if not cands:
        cands = [c for c in contracts if c["kind"] == "transact" and (c.get("transaction") == sid or c["stem"] == sid)]
    def same_or_any(kind):
        found = [c for c in contracts if c["kind"] == kind and (c.get("transaction") == sid or c["stem"] == sid)]
        local = [c for c in found if c["module"] == mod]
        return local or found

    others = {k: same_or_any(k) for k in ("dbclient", "function", "command", "graphclient", "prompter")}
    out["contracts"] = {"transact": [c["path"] for c in cands], **{k: [c["path"] for c in v] for k, v in others.items()}}
    if len(cands) > 1:
        add("INFO", "AMBIGUOUS", f"같은 ID의 .txn이 {len(cands)}개다: " + ", ".join(c["module"] for c in cands))
    services = {}
    for c in cands:
        if c["error"]:
            add("ERROR", "TXN_PARSE", f"{Path(c['path']).name}: {c['error']}")
        services.update(c.get("services", {}))

    controls = page.controls
    stores = {s["source"]: s for s in page.stores}
    datafields = {c["field"] for c in controls if c["field"]} | set(page.forms) | set(stores)

    def fields_for(tx_id, data_field):
        found = []
        for c in controls:
            if c["tag"] in GRID_TAGS and c["field"] == data_field:
                found += [x["field"] for x in c.get("columns", []) if tx_id in x["belong"]]
            elif c["form"] == data_field and c["field"] and c["tag"] not in GRID_TAGS and tx_id in c["belong"]:
                found.append(c["field"])
        st = stores.get(data_field)
        if st:
            found += [x["field"] for x in st["columns"] if tx_id in x["belong"]]
        return found

    belong_used = {b for c in controls for b in c["belong"]} | {b for c in controls for x in c.get("columns", []) for b in x["belong"]} \
        | {b for s in page.stores for x in s["columns"] for b in x["belong"]}
    for key_, tx in js["transactions"].items():
        fid = tx["functionID"]
        row = {"service": fid, "inputs": [], "outputs": [], "callback": tx["callback"], "sql": [], "fn": []}
        for inp in tx["inputs"]:
            fl = fields_for(fid, inp["dataFieldID"])
            row["inputs"].append({**inp, "fields": fl})
            if page.controls or page.stores or page.forms:
                if inp["dataFieldID"] not in datafields:
                    add("ERROR", "INPUT_TARGET", f"{fid}: 입력 dataFieldID '{inp['dataFieldID']}'에 해당하는 form/컨트롤/syn_data가 HTML에 없다")
        for outp in tx["outputs"]:
            row["outputs"].append(outp)
            if outp["dataFieldID"] and (page.controls or page.stores or page.forms) and outp["dataFieldID"] not in datafields:
                add("ERROR", "OUTPUT_TARGET", f"{fid}: 출력 dataFieldID '{outp['dataFieldID']}'에 해당하는 컨트롤/syn_data가 HTML에 없다(런타임 Output Mapping 오류)")
        svc = services.get(fid)
        if cands and svc is None:
            add("ERROR", "NO_SERVICE", f"{fid}: .txn Services에 ServiceID '{fid}'가 없다")
        if svc:
            ctype = svc.get("CommandType", "D")
            row["commandType"] = ctype
            ci, co = svc.get("Inputs") or [], svc.get("Outputs") or []
            if ci and len(ci) != len(tx["inputs"]):
                add("ERROR", "INPUT_COUNT", f"{fid}: .txn Inputs {len(ci)}개와 화면 inputs {len(tx['inputs'])}개가 다르다")
            visible = len([o for o in co if not ((o.get("BaseFieldRelation") or {}).get("DisposeResult") is True)])
            if co and visible != len(tx["outputs"]):
                add("ERROR", "OUTPUT_COUNT", f"{fid}: .txn Outputs {len(co)}개(DisposeResult 제외 {visible}개)와 화면 outputs {len(tx['outputs'])}개가 다르다")
            target = "dbclient" if ctype == "D" else "function" if ctype == "F" else "command" if ctype == "C" else \
                "graphclient" if ctype == "G" else "prompter" if ctype == "P" else None
            if target:
                found = False
                params = []
                for c in others.get(target, []):
                    items = c.get("items", {})
                    sid2 = svc.get("ServiceID")
                    if isinstance(items, dict) and sid2 in items:
                        found = True
                        row["sql" if target != "function" else "fn"] = [{"file": Path(c["path"]).name, "id": sid2,
                                                                       "seq": [x["seq"] for x in items[sid2]]}]
                        for x in items[sid2]:
                            params += x["params"]
                if not found:
                    add("ERROR" if others.get(target) else "WARN", "NO_STATEMENT",
                        f"{fid}: {target} 계약에서 id '{fid}'를 찾지 못했다" + ("" if others.get(target) else " (계약 파일 자체가 없음)"))
                else:
                    sent = {f.lower() for i in row["inputs"] for f in i["fields"]}
                    pset = {p.lower() for p in params}
                    miss = sorted(p for p in pset if p not in sent and p not in IMPLICIT_PARAMS and not p.startswith("$"))
                    if miss and not sent and row["inputs"]:
                        add("WARN", "NO_INPUT_FIELDS", f"{fid}: SQL 파라미터 {', '.join(miss)}가 있으나 belongID에 {fid}를 포함한 전송 필드가 화면에 없다")
                    elif miss and sent:
                        add("INFO", "PARAM_NOT_SENT", f"{fid}: SQL 파라미터 {', '.join(miss)}는 belongID로 전송되는 화면 필드에 없다(서버 변수/기본값일 수 있음)")
        out["transactions"][fid] = row

    all_txn = [c for c in contracts if c["kind"] == "transact" and not c["error"]]
    for sid_, svc_ in services.items():
        steps = svc_.get("WorkflowSteps") or []
        if svc_.get("CommandType") == "W" and not steps:
            add("ERROR", "WORKFLOW_EMPTY", f"{sid_}: CommandType W 서비스에 WorkflowSteps가 없다")
        seen_steps = []
        for idx, st in enumerate(steps):
            step_id = st.get("StepID") or f"{st.get('CommandType', '')}{str(idx + 1).zfill(2)}"
            if step_id in seen_steps:
                add("ERROR", "WORKFLOW_STEP_DUP", f"{sid_}: StepID '{step_id}'가 중복되었다")
            t_proj = st.get("TransactionProjectID") or (cands[0].get("project") if cands else "")
            t_tx = st.get("TransactionID") or (cands[0].get("transaction") if cands else sid)
            t_svc = st.get("ServiceID") or sid_
            target = [c for c in all_txn if c.get("transaction") == t_tx and (not t_proj or c.get("project") == t_proj or c.get("top_project") == t_proj)]
            if not target:
                add("WARN", "WORKFLOW_TARGET", f"{sid_}/{step_id}: 대상 거래 {t_proj}/{t_tx}를 점검 범위에서 찾지 못했다(다른 루트일 수 있음)")
            elif not any(t_svc in c.get("services", {}) for c in target):
                expect_fail = any(str(a.get("Assert", "")).upper() == "THROWS" for a in st.get("Assertions") or [])
                add("INFO" if expect_fail else "ERROR", "WORKFLOW_SERVICE",
                    f"{sid_}/{step_id}: 대상 거래 {t_tx}에 ServiceID '{t_svc}'가 없다" + (" (Throws 검증으로 실패를 기대한 단계)" if expect_fail else ""))
            for mp in st.get("InputMappings") or []:
                src = mp.get("SourceStepID") or ""
                if src and src not in seen_steps:
                    add("ERROR", "WORKFLOW_SOURCE_STEP", f"{sid_}/{step_id}: InputMappings의 SourceStepID '{src}'가 앞선 단계에 없다")
            for asr in st.get("Assertions") or []:
                if str(asr.get("Assert", "")).upper() not in WORKFLOW_ASSERTS:
                    add("ERROR", "WORKFLOW_ASSERT", f"{sid_}/{step_id}: 알 수 없는 Assert '{asr.get('Assert')}'")
                for key_ in ("Expected", "Actual", "Value", "Min", "Max", "Collection"):
                    ref = asr.get(key_) or {}
                    src = ref.get("SourceStepID") or ""
                    if src and src not in seen_steps + [step_id]:
                        add("ERROR", "WORKFLOW_SOURCE_STEP", f"{sid_}/{step_id}: Assertions.{key_}.SourceStepID '{src}'가 없다")
            seen_steps.append(step_id)
    for name in js["actions"]:
        if name not in js["transactions"]:
            add("WARN", "ACTION_UNDEFINED", f"transactionAction('{name}')의 거래 설정이 transaction 객체에 없다")
    for b in sorted(belong_used - set(js["transactions"]) - {""}):
        add("INFO", "BELONG_NO_TX", f"belongID '{b}'를 가진 컨트롤은 있으나 이 화면의 transaction에는 없다(다른 거래용이거나 오타)")
    unused = sorted(set(services) - {t["functionID"] for t in js["transactions"].values()} - set(js["actions"]))
    if unused and js["transactions"]:
        add("INFO", "SERVICE_UNUSED", "이 화면에서 참조하지 않는 .txn 서비스: " + ", ".join(unused[:30]))
    for t_name, tx in js["transactions"].items():
        if tx["callback"]:
            add("INFO", "CALLBACK_AFTER", f"{t_name}: callback이 있으면 callback이 true/null을 반환할 때만 hook.afterTransaction이 호출된다")
    out["directs"] = js["directs"]
    out["hooks"] = js["hooks"]
    out["events"] = js["events"]
    out["layout"] = {"scripts": page.scripts[:5], "bodyStyle": page.body_style, "forms": page.forms}
    for c in contracts:
        if c["error"] and c["kind"] != "transact" and c["stem"] == sid:
            add("ERROR", "CONTRACT_PARSE", f"{Path(c['path']).name}: {c['error']}")
        for dup in c.get("duplicates", []) if c["stem"] == sid else []:
            add("ERROR", "DUP_STATEMENT", f"{Path(c['path']).name}: (id, seq) {dup} 중복")
    return out


def render(res, limit, verbose=False):
    lines = [f"## {res['module']} / {res['projectDir']} / {res['screen']}"]
    for k, v in res["files"].items():
        for p in v:
            lines.append(f"- {k}: {p}")
    for k, v in res.get("contracts", {}).items():
        for p in v:
            lines.append(f"- {k}: {p}")
    lines.append(f"- hooks: {', '.join(res['hooks']) or '-'}")
    if res["transactions"]:
        lines.append("")
        lines.append("| 서비스 | 입력(type:dataField=전송 필드) | 출력(순서) | 실행 | callback |")
        lines.append("|---|---|---|---|---|")
        for fid, t in res["transactions"].items():
            inp = "; ".join(f"{i['type']}:{i['dataFieldID']}=[{','.join(i['fields'][:12])}{'…' if len(i['fields']) > 12 else ''}]" for i in t["inputs"]) or "-"
            outp = " → ".join(f"{o['type']}:{o['dataFieldID']}" for o in t["outputs"]) or "-"
            run = ",".join(f"{x['file']}#{x['id']}(seq {'/'.join(x['seq'])})" for x in (t["sql"] or t["fn"])) or t.get("commandType", "?")
            lines.append(f"| {fid} | {inp} | {outp} | {run} | {'Y' if t['callback'] else '-'} |")
    if res["directs"]:
        lines.append("")
        lines.append("직접 호출(transactionDirect): " + "; ".join("/".join(str(d.get(k, "?")) for k in ("programID", "businessID", "transactionID", "functionID")) for d in res["directs"][:limit]))
    order = {"ERROR": 0, "WARN": 1, "INFO": 2}
    finds = sorted((f for f in res["findings"] if verbose or f["severity"] != "INFO"), key=lambda f: order[f["severity"]])
    lines.append("")
    hidden = len(res["findings"]) - len(finds)
    lines.append(f"### 점검 결과 ({len(finds)}건" + (f", INFO {hidden}건은 --verbose" if hidden else "") + ")")
    for f in finds[:limit]:
        lines.append(f"- [{f['severity']}] {f['code']}: {f['message']}")
    if len(finds) > limit:
        lines.append(f"- … {len(finds) - limit}건 생략(--limit 으로 조정)")
    return "\n".join(lines)


def main(argv=None):
    ap = argparse.ArgumentParser(description="HandStack 화면-계약 흐름 점검(읽기 전용)")
    ap.add_argument("--root", action="append", default=None, help="탐색할 프로젝트 루트(여러 번 지정 가능). 기본값은 현재 폴더")
    ap.add_argument("--screen", action="append", default=[], help="점검할 화면/거래 ID. 생략하면 --list 와 같다")
    ap.add_argument("--module", default="", help="경로(모듈 폴더명)에 이 문자열이 포함된 항목만")
    ap.add_argument("--list", action="store_true", help="발견한 화면 ID 목록만 출력")
    ap.add_argument("--json", action="store_true", help="JSON으로 출력")
    ap.add_argument("--fail-on", choices=("ERROR", "WARN", "never"), default="never", help="해당 수준 이상이 있으면 종료 코드 1")
    ap.add_argument("--verbose", action="store_true", help="INFO 수준 항목도 출력")
    ap.add_argument("--limit", type=int, default=60, help="섹션별 최대 출력 줄 수")
    args = ap.parse_args(argv)
    roots = [Path(r).resolve() for r in (args.root or ["."])]
    for r in roots:
        if not r.is_dir():
            print(f"루트 폴더가 없다: {r}", file=sys.stderr)
            return 2
    screens, contracts = collect(roots)
    keys = [k for k in screens if args.module.lower() in k[0].lower()]
    if args.list or not args.screen:
        for k in sorted(keys):
            print(f"{k[0]}\t{k[1]}\t{k[2]}")
        print(f"# 화면 {len(keys)}개, 계약 {len(contracts)}개 발견", file=sys.stderr)
        return 0
    wanted = {s.lower() for s in args.screen}
    picked = [k for k in sorted(keys) if k[2].lower() in wanted]
    # 계약만 있고 화면이 없는 ID도 보고한다
    missing = [s for s in args.screen if s.lower() not in {k[2].lower() for k in picked}]
    results = [analyze_screen(k, screens[k], contracts) for k in picked]
    for sid_ in list(missing):
        found = sorted({(c["module"], c.get("project_dir") or c.get("project") or "", c["stem"]) for c in contracts
                        if (c["stem"].lower() == sid_.lower() or str(c.get("transaction", "")).lower() == sid_.lower())
                        and args.module.lower() in c["module"].lower()})
        for key_ in found:
            results.append(analyze_screen(key_, {"html": [], "js": []}, contracts))
            if sid_ in missing:
                missing.remove(sid_)
    if args.json:
        print(json.dumps({"results": results, "notFound": missing}, ensure_ascii=False, indent=1))
    else:
        for r in results:
            print(render(r, args.limit, args.verbose))
            print()
        for s in missing:
            print(f"화면 '{s}'을(를) view 경로에서 찾지 못했다. --list 로 ID를 확인한다.")
    worst = {"ERROR": 2, "WARN": 1}
    level = {"ERROR": 2, "WARN": 1, "never": 99}[args.fail_on]
    if any(worst.get(f["severity"], 0) >= level for r in results for f in r["findings"]):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
