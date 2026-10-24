#!/usr/bin/env python3
"""배포 ZIP 생성·검증. 스킬, 가이드, 설치기, 점검 도구, 테스트, README만 포함한다(분석 메모·검증 작업 폴더 제외)."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile


def main():
    base = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=base / 'handstack-developer-skills.zip')
    args = parser.parse_args()
    files = [base / 'README.md', base / 'Install-Skills.ps1']
    for folder in ('skills', 'scripts', 'tests', 'guides'):
        files.extend(p for p in (base / folder).rglob('*') if p.is_file()
                     and '__pycache__' not in p.parts and p.suffix not in ('.pyc', '.pyo'))
    for path in files:
        if not path.is_file():
            parser.error(f'missing bundle file: {path}')
    with zipfile.ZipFile(args.output, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(files):
            archive.write(path, path.relative_to(base).as_posix())
    with zipfile.ZipFile(args.output) as archive:
        if archive.testzip() is not None:
            raise ValueError('archive CRC validation failed')
        for path in files:
            if archive.read(path.relative_to(base).as_posix()) != path.read_bytes():
                raise ValueError(f'archive content mismatch: {path}')
    print(json.dumps({'archive': str(args.output), 'files': len(files),
                      'bytes': args.output.stat().st_size,
                      'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest()}, indent=2))


if __name__ == '__main__':
    main()
