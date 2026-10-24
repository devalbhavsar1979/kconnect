"""Copy only non-secret legacy source into an isolated Phase 0 reference.

No installation, application execution, database access or legacy writes.
An existing differing destination is never overwritten.
"""
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
from discover import OLD, NEW, OUT, digest, legacy_manifest, read


def main():
    frozen = json.loads(read(OUT / 'legacy-source-hashes.json'))
    assert legacy_manifest() == frozen, 'Legacy baseline changed; stop for review'
    destination = NEW / 'baseline' / 'legacy'
    selected = {name: checksum for name, checksum in frozen.items()
                if name.startswith(('backend/', 'frontend/'))
                and not name.startswith('frontend/dev-dist/')}
    for name, checksum in selected.items():
        target = destination / name
        if target.exists() and digest(target) != checksum:
            raise SystemExit(f'Refusing to overwrite changed reference: {name}')
    for name, checksum in selected.items():
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_bytes((OLD / name).read_bytes())
        assert digest(target) == checksum
    (NEW / 'baseline/source-copy-manifest.json').write_text(
        json.dumps({'scope': 'Source only; no .env secrets, uploaded files or generated development service worker',
                    'files': selected}, indent=2) + '\n', encoding='utf-8')
    assert legacy_manifest() == frozen
    print(f'PASS: {len(selected)} source files copied and hash-verified; legacy unchanged.')


if __name__ == '__main__':
    main()
