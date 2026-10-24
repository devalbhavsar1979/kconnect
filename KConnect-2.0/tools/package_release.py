"""Package a production dependency tree and unchanged frontend; no secrets."""
import argparse
import hashlib
import io
import json
import re
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def package(release, commit, destination):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,79}', release):
        raise ValueError('Invalid release ID')
    backend = ROOT / 'backend'
    installed = json.loads((backend / 'vendor/composer/installed.json').read_text(encoding='utf-8'))
    if installed.get('dev', True):
        raise ValueError('Install locked Composer dependencies with --no-dev before packaging')
    dist = ROOT / 'frontend/dist'
    if not (dist / 'index.html').is_file():
        raise ValueError('Frontend build missing')
    files = {}
    for folder in ('app', 'bootstrap', 'config', 'routes', 'public', 'vendor', 'database/migrations'):
        for path in sorted((backend / folder).rglob('*')):
            if not path.is_file():
                continue
            rel = path.relative_to(backend).as_posix()
            if rel.startswith('bootstrap/cache/'):
                continue
            if path.is_symlink():
                raise ValueError('Symlinks not permitted in release')
            files['backend/' + rel] = path.read_bytes()
    for name in ('artisan', 'composer.json', 'composer.lock'):
        files['backend/' + name] = (backend / name).read_bytes()
    for path in sorted(dist.rglob('*')):
        if path.is_file():
            files['backend/resources/spa/' + path.relative_to(dist).as_posix()] = path.read_bytes()
    files['backend/release-id'] = (release + '\n').encode()
    files['deployment/public.htaccess'] = (ROOT / 'deployment/public.htaccess').read_bytes()
    files['deployment/public-bootstrap.php.template'] = (ROOT / 'deployment/public-bootstrap.php.template').read_bytes()
    if 'backend/database/migrations/2026_10_19_000001_create_domain_schema.php' not in files:
        raise ValueError('Phase 2 baseline migration is missing')
    manifest = {'format': 1, 'release': release, 'commit': commit, 'php': '>=8.4 <8.6',
                'schema_epoch': 'phase2-baseline', 'migrations': ['2026_10_19_000001_create_domain_schema'],
                'bytes': sum(map(len, files.values())),
                'files': {name: hashlib.sha256(data).hexdigest() for name, data in sorted(files.items())}}
    files['manifest.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
    destination.mkdir(parents=True, exist_ok=True)
    archive = destination / (release + '.tar.gz')
    if archive.exists():
        raise ValueError('Immutable release already exists; use a new ID')
    with tarfile.open(archive, 'w:gz', format=tarfile.USTAR_FORMAT) as tar:
        for name, data in sorted(files.items()):
            info = tarfile.TarInfo(name)
            info.size, info.mode, info.mtime = len(data), 0o644, 0
            tar.addfile(info, io.BytesIO(data))
    checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
    archive.with_suffix(archive.suffix + '.sha256').write_text(checksum + '\n')
    print(json.dumps({'archive': str(archive), 'sha256': checksum, 'files': len(files)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--release', required=True)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'artifacts')
    args = parser.parse_args()
    package(args.release, args.commit, args.output)
