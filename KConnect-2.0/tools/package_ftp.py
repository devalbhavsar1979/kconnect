"""Prepare FTP-ready directories from the already tested immutable Phase 2 archive.

No secrets, caches, remote commands, automatic activation or database changes.
"""
import hashlib
import json
import os
import re
import tarfile
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
if os.name=='nt': ROOT=Path('\\\\?\\'+str(ROOT))
RELEASE='phase2-20261019-001'
OUT=ROOT/'artifacts/ftp-phase2-20261019-001'
archive=ROOT/f'artifacts/{RELEASE}.tar.gz'
expected=archive.with_suffix(archive.suffix+'.sha256').read_text().strip()
assert hashlib.sha256(archive.read_bytes()).hexdigest()==expected
private=OUT/'upload-private/kconnect-staging-private'
release=private/'releases'/RELEASE
public=OUT/'upload-public/app.kconnect.in'
if public.exists():
    raise SystemExit('FTP payload already exists; do not overwrite an immutable prepared package')
with tarfile.open(archive) as tar:
    manifest=json.load(tar.extractfile('manifest.json'))
    assert manifest['release']==RELEASE
    names=[]
    for member in tar.getmembers():
        if not member.isfile() or member.name.startswith('/') or '..' in Path(member.name).parts or '\\' in member.name:
            raise ValueError('Unsafe archive entry')
        data=tar.extractfile(member).read()
        if member.name!='manifest.json':
            assert hashlib.sha256(data).hexdigest()==manifest['files'][member.name]
            names.append(member.name)
        target=release/member.name
        target.parent.mkdir(parents=True,exist_ok=True)
        if target.exists() and target.read_bytes()!=data:
            raise ValueError('Existing partial payload differs; refusing to overwrite')
        target.write_bytes(data)
    assert set(names)==set(manifest['files'])
public.mkdir(parents=True)
template=(release/'deployment/public-bootstrap.php.template').read_text()
(public/'index.php').write_text(template.replace('__PRIVATE_ROOT__',"'/home/nljgfkqgux/kconnect-staging-private'"),encoding='utf-8')
(public/'.htaccess').write_bytes((release/'deployment/public.htaccess').read_bytes())
(public/'.kconnect-owned').write_text('phase1')
spa=release/'backend/resources/spa'
for asset in spa.rglob('*'):
    if not asset.is_file(): continue
    relative=asset.relative_to(spa)
    if relative.parts[0]=='assets' or re.fullmatch(r'workbox-[a-f0-9]+\.js',relative.as_posix()):
        target=public/relative
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(asset.read_bytes())
# Writable directories only, without any environment, compiled cache or user data.
for target in [release/'backend/bootstrap/cache', *[private/'shared/storage'/p for p in ['logs','framework/cache/data','framework/sessions','framework/views','app/uploads/cvs']]]:
    target.mkdir(parents=True,exist_ok=True)
    (target/'.gitkeep').touch()
activation=OUT/'activate-last'
activation.mkdir()
(activation/'current.json').write_text(json.dumps({'release':RELEASE,'previous':None,'schema_epoch':'phase2-baseline'},indent=2)+'\n')
(OUT/'FTP_UPLOAD_GUIDE.md').write_bytes((ROOT/'docs/phase-2/FTP_UPLOAD_GUIDE.md').read_bytes())
files=[]
for directory in ['upload-private','upload-public','activate-last','sql']:
    files.extend(p for p in (OUT/directory).rglob('*') if p.is_file())
files.append(OUT/'FTP_UPLOAD_GUIDE.md')
assert not any(p.name=='.env' or p.name=='LOCAL_TEST_LOGINS.txt' for p in files)
hashes={p.relative_to(OUT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
(OUT/'SHA256SUMS.json').write_text(json.dumps(hashes,indent=2)+'\n')
files.append(OUT/'SHA256SUMS.json')
bundle=ROOT/'artifacts/phase2-20261019-001-FTP.zip'
with zipfile.ZipFile(bundle,'x',compression=zipfile.ZIP_DEFLATED) as z:
    for path in files: z.write(path,path.relative_to(OUT).as_posix())
print(json.dumps({'bundle':str(bundle),'files':len(files),'sha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'source_archive_sha256':expected}))
