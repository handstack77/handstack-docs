#!/usr/bin/env python3
"""HandStack 화면 HTML 정적 린트 (읽기 전용, Python 3.10+, 표준 라이브러리만 사용).

프레임워크 DESIGN.md의 "준수 검증 체크리스트" 중 기계 검증이 가능한 항목과 "존재하지 않는 클래스" 목록을
검사한다. 프로젝트마다 DESIGN.md가 다를 수 있으므로 규칙은 --disable 로 끌 수 있고, 결과는 후보로 취급한다.
신규 화면에는 모두 적용하고 기존 화면은 수정한 범위의 항목만 고친다.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

EXCLUDED_DIRS = {"node_modules", "bin", "obj", ".git", "lib", "libs", "vendor", "dist", "publish"}

KNOWN_SYN_TAGS = {
    "syn_auigrid", "syn_auipivot", "syn_opengrid", "syn_grid", "syn_list", "syn_data", "syn_datepicker", "syn_dateperiodpicker",
    "syn_codepicker", "syn_tree", "syn_organization", "syn_fileclient", "syn_filedropzone", "syn_htmleditor", "syn_chartjs",
    "syn_chart", "syn_echarts", "syn_contextmenu", "syn_guide", "syn_sourceeditor", "syn_jsoneditor", "syn_colorpicker",
    "syn_calendar", "syn_propertypanel", "syn_googlemap", "syn_navermap", "syn_mediaplayer", "syn_signaturepad",
    "syn_bfile", "syn_editor", "syn_filtertagtextlist", "syn_dropdowntextlist", "syn_barcalender", "syn_textbutton",
}

RULES = {
    "icon-font": ("ERROR", "타 아이콘 폰트(fa-/bi-) 또는 인라인 <svg> 사용 — Tabler Icons(ti ti-*) 웹폰트만 사용"),
    "hex-color": ("ERROR", "class/style 속성에 HEX 색상 하드코딩 — Tabler 색상 유틸리티 사용"),
    "inline-style": ("WARN", "인라인 시각 스타일(color/background/font-size/border) — display/visibility 토글 외 금지"),
    "missing-class": ("ERROR", "번들(Tabler 1.3.2/Master CSS)에 없는 클래스"),
    "container": ("WARN", "container-xl/container 고정 폭 — container-fluid + max-width:NNNN! 사용"),
    "popup-mix": ("ERROR", "한 화면에 simplemodal-data와 Bootstrap modal 혼용"),
    "required-star": ("WARN", "라벨 텍스트에 * 하드코딩 — 라벨에 required 클래스만 추가"),
    "icon-button-label": ("WARN", "아이콘 전용 버튼에 aria-label 없음"),
    "table-list": ("INFO", "순수 <table> — 업무 목록은 syn_auigrid (RPT 인쇄 화면·소량 읽기 전용 요약표만 예외)"),
    "cdn": ("WARN", "CDN/@latest 참조 — 로컬 번들 사용"),
    "skeleton": ("WARN", "페이지 골격(page > page-wrapper > page-header/page-body > container-fluid) 누락"),
    "div-click": ("WARN", "div/span onclick — button/a 사용"),
    "unknown-syn": ("WARN", "알 수 없는 syn_* 태그 — 존재하지 않는 컴포넌트를 추측하지 않는다"),
    "badge-blink": ("ERROR", "badge-blink 사용 금지(접근성)"),
    "id-duplicate": ("WARN", "문서 내 id 중복"),
}

MISSING_CLASS = re.compile(
    r"^(alert-title|border-dashed|border-dotted|border-r|border-t|ml-\d+|mr-\d+|pl-\d+|pr-\d+|tracking-(tight|wide)|btn-xs|btn-xl|"
    r"progress-lg|progress-steps|font-weight-[a-z]+|align-content-baseline|datagrid-content|datagrid-item|icon-sm|icon-lg)$")


def line_of(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def lint(text: str, path: str, disabled: set[str]) -> list[dict]:
    out: list[dict] = []

    def add(rule: str, pos: int, detail: str = "") -> None:
        if rule in disabled:
            return
        sev, msg = RULES[rule]
        out.append({"file": path, "line": line_of(text, pos), "rule": rule, "severity": sev,
                    "message": msg + (f": {detail}" if detail else "")})

    # 주석 안의 코드는 검사하지 않는다(위치 보존을 위해 같은 길이의 공백으로 치환)
    stripped = re.sub(r"<!--.*?-->", lambda m: re.sub(r"[^\n]", " ", m.group(0)), text, flags=re.S)
    stripped = re.sub(r"<script\b.*?</script>", lambda m: re.sub(r"[^\n]", " ", m.group(0)), stripped, flags=re.S | re.I)
    stripped = re.sub(r"<style\b.*?</style>", lambda m: re.sub(r"[^\n]", " ", m.group(0)), stripped, flags=re.S | re.I)

    for m in re.finditer(r"""class\s*=\s*"([^"]*)"|class\s*=\s*'([^']*)'""", stripped):
        classes = (m.group(1) or m.group(2) or "").split()
        for c in classes:
            if re.match(r"^(fa|fas|far|fab|fal|bi)$", c) or re.match(r"^(fa|bi)-", c):
                add("icon-font", m.start(), c)
            elif MISSING_CLASS.match(c):
                if c in ("icon-sm", "icon-lg") and not any(x == "ti" for x in classes):
                    continue
                add("missing-class", m.start(), c)
            elif c in ("container-xl", "container"):
                add("container", m.start(), c)
            elif c == "badge-blink":
                add("badge-blink", m.start())
            if re.search(r"(?:^|[^\w-])#[0-9a-fA-F]{3,8}(?![\w-])", c):
                add("hex-color", m.start(), c)
    for m in re.finditer(r"<svg\b", stripped, re.I):
        add("icon-font", m.start(), "<svg>")
    for m in re.finditer(r"""\sstyle\s*=\s*"([^"]*)"|\sstyle\s*=\s*'([^']*)'""", stripped):
        css = m.group(1) or m.group(2) or ""
        if re.search(r"#[0-9a-fA-F]{3,8}\b", css):
            add("hex-color", m.start(), css.strip()[:60])
        elif re.search(r"(?<![-\w])(color|background(-color)?|font-size|border(-[a-z]+)?)\s*:", css) and \
                not re.fullmatch(r"\s*(display|visibility)\s*:[^;]*;?\s*", css):
            add("inline-style", m.start(), css.strip()[:60])
    if re.search(r"simplemodal-data", stripped) and re.search(r"""class\s*=\s*"[^"]*\bmodal-dialog\b""", stripped):
        add("popup-mix", stripped.find("modal-dialog"))
    for m in re.finditer(r"<label\b[^>]*>(.*?)</label>", stripped, re.S | re.I):
        inner = re.sub(r"<[^>]+>", "", m.group(1))
        if re.search(r"\*\s*$|\*\s*\(|^\s*\*", inner.strip()):
            add("required-star", m.start(), inner.strip()[:30])
    for m in re.finditer(r"<button\b([^>]*)>(.*?)</button>", stripped, re.S | re.I):
        attrs, inner = m.group(1), m.group(2)
        text_only = re.sub(r"<[^>]+>", "", inner).strip()
        if not text_only and re.search(r"\bti-", inner) and "aria-label" not in attrs and "title=" not in attrs:
            add("icon-button-label", m.start())
    for m in re.finditer(r"<table\b", stripped, re.I):
        add("table-list", m.start())
    for m in re.finditer(r"""<(?:script|link)\b[^>]*(?:src|href)\s*=\s*["']((?:https?:)?//[^"']+)["']""", stripped, re.I):
        add("cdn", m.start(), m.group(1)[:70])
    for m in re.finditer(r"""<(div|span)\b[^>]*\sonclick\s*=""", stripped, re.I):
        add("div-click", m.start(), m.group(1))
    for tag in set(re.findall(r"<(syn_[a-z0-9_]+)", stripped, re.I)):
        if tag.lower() not in KNOWN_SYN_TAGS:
            add("unknown-syn", stripped.lower().find("<" + tag.lower()), tag)
    ids = re.findall(r"""\sid\s*=\s*["']([^"']+)["']""", stripped)
    for dup in sorted({i for i in ids if ids.count(i) > 1}):
        add("id-duplicate", stripped.find(f'id="{dup}"'), dup)
    is_fragment = "<form" in stripped.lower() and "syn.loader" in text
    if is_fragment and not Path(path).name.upper().startswith("RPT"):
        need = ("page-wrapper", "page-body")
        if not all(n in stripped for n in need) or "container-fluid" not in stripped:
            add("skeleton", 0)
    return out


def iter_files(paths: list[Path]):
    for p in paths:
        if p.is_file():
            yield p
        else:
            for f in sorted(p.rglob("*.html")):
                if not any(part in EXCLUDED_DIRS for part in f.relative_to(p).parts[:-1]):
                    yield f


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    for enc in ("utf-8-sig", "cp949"):
        try:
            return raw.decode(enc)
        except UnicodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="HandStack 화면 HTML 린트(읽기 전용)")
    ap.add_argument("paths", nargs="+", type=Path, help="HTML 파일 또는 폴더")
    ap.add_argument("--disable", action="append", default=[], help="끌 규칙 id (여러 번). 규칙 목록은 --list-rules")
    ap.add_argument("--list-rules", action="store_true")
    ap.add_argument("--min-severity", choices=("INFO", "WARN", "ERROR"), default="WARN")
    ap.add_argument("--fail-on", choices=("ERROR", "WARN", "never"), default="never")
    ap.add_argument("--limit", type=int, default=200)
    args = ap.parse_args(argv)
    if args.list_rules:
        for rid, (sev, msg) in RULES.items():
            print(f"{rid}\t{sev}\t{msg}")
        return 0
    order = {"INFO": 0, "WARN": 1, "ERROR": 2}
    disabled = set(args.disable)
    unknown = disabled - set(RULES)
    if unknown:
        print("알 수 없는 규칙: " + ", ".join(sorted(unknown)), file=sys.stderr)
        return 2
    findings = []
    count = 0
    for f in iter_files(args.paths):
        count += 1
        findings += lint(read_text(f), str(f), disabled)
    shown = [x for x in findings if order[x["severity"]] >= order[args.min_severity]]
    for x in shown[: args.limit]:
        print(f"{x['file']}:{x['line']}: [{x['severity']}] {x['rule']}: {x['message']}")
    if len(shown) > args.limit:
        print(f"… {len(shown) - args.limit}건 생략(--limit)")
    print(f"# 파일 {count}개, 표시 {len(shown)}건(전체 {len(findings)}건)", file=sys.stderr)
    worst = {"ERROR": 2, "WARN": 1}
    level = {"ERROR": 2, "WARN": 1, "never": 99}[args.fail_on]
    return 1 if any(worst.get(x["severity"], 0) >= level for x in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
