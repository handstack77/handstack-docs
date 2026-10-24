#!/usr/bin/env python3
"""스킬·가이드가 인용한 docs/ 문서 경로가 실제로 있는지 확인한다 (표준 라이브러리만 사용).

인용 형식: 백틱 안의 `reference/거래-호출`처럼 docs/ 기준 문서 id(확장자 없음, 폴더 앞 번호 접두사 제외)나
https://handstack.kr/docs/<경로>. 첫 경로 조각이 docs/ 바로 아래 폴더 이름일 때만 문서 경로로 본다.
- `경로/*`는 그 폴더가 있는지, `경로#앵커`는 경로만 확인한다.
- docs와 같은 이름으로 시작하는 번들 내부 경로(예: guides/templates/…)는 번들에 있으면 통과한다.
"""
import argparse
import re
import sys
import unicodedata
from pathlib import Path

CODE = re.compile(r"`([^`\n]+)`")
URL = re.compile(r"https://handstack\.kr/docs/([^\s)`'\"<>]+)")


def nfc(text):
    return unicodedata.normalize("NFC", text)


def docusaurus_path(rel):
    """Docusaurus 문서 id처럼 경로 조각 앞의 번호 접두사(`5.`, `01-`)를 제거한다."""
    return "/".join(re.sub(r"^\d+\s*[-_.]+\s*", "", part) for part in rel.split("/"))


def doc_ids(docs_root):
    """docs/ 안의 문서 id(확장자 없는 상대 경로, frontmatter id 반영, index는 폴더 경로도)와 폴더 집합."""
    ids, folders = set(), set()
    for path in docs_root.rglob("*"):
        rel = docusaurus_path(nfc(path.relative_to(docs_root).as_posix()))
        if path.is_dir():
            folders.add(rel)
            continue
        if path.suffix not in (".md", ".mdx"):
            continue
        stem = rel[: -len(path.suffix)]
        ids.add(stem)
        if stem.endswith("/index") or stem.endswith("/README"):
            ids.add(stem.rsplit("/", 1)[0])
        match = re.match(r"^---\n(.*?)\n---", path.read_text(encoding="utf-8").replace("\r\n", "\n"), re.S)
        custom = re.search(r"^id:\s*['\"]?([^'\"\n]+)", match.group(1), re.M) if match else None
        if custom:
            ids.add(nfc(f"{stem.rsplit('/', 1)[0]}/{custom.group(1).strip()}") if "/" in stem else nfc(custom.group(1).strip()))
    return ids, folders


def citations(text, top_dirs):
    for number, line in enumerate(text.split("\n"), 1):
        for token in CODE.findall(line):
            token = nfc(token.strip())
            if " " in token or "<" in token or token.startswith(("/", ".", "~")) or "/" not in token:
                continue
            if token.split("/", 1)[0] in top_dirs:
                yield number, token
        for token in URL.findall(line):
            token = nfc(token.rstrip(".,;"))
            if "<" not in token:
                yield number, token


def resolve(token, ids, folders):
    path = token.split("#", 1)[0].rstrip("/")
    if path.endswith("/*"):
        return path[:-2] in folders
    return path in ids or path in folders


def check(bundle_root, docs_root):
    ids, folders = doc_ids(docs_root)
    top_dirs = {docusaurus_path(nfc(p.name)) for p in docs_root.iterdir() if p.is_dir()}
    errors, checked = [], 0
    for path in sorted(bundle_root.rglob("*.md")):
        if "config" in path.relative_to(bundle_root).parts[:1]:
            continue
        text = path.read_text(encoding="utf-8").replace("\r\n", "\n")
        for number, token in citations(text, top_dirs):
            checked += 1
            if resolve(token, ids, folders):
                continue
            if (bundle_root / token.split("#", 1)[0]).exists():
                continue
            errors.append(f"{path.relative_to(bundle_root).as_posix()}:{number}: docs에 없는 문서 경로 `{token}`")
    return checked, errors


def main(argv=None):
    base = Path(__file__).resolve().parents[1]
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--bundle-root", type=Path, default=base)
    ap.add_argument("--docs-root", type=Path, default=base.parent / "docs")
    args = ap.parse_args(argv)
    if not args.docs_root.is_dir():
        print(f"ERROR: docs 폴더가 없음: {args.docs_root}")
        return 1
    checked, errors = check(args.bundle_root, args.docs_root)
    for error in errors:
        print("ERROR:", error)
    print(f"문서 경로 인용 {checked}건 확인; 오류 {len(errors)}개")
    return 1 if errors else 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
