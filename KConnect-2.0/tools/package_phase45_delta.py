"""Build the combined Phase 4/5 overlay against the immutable, deployed Phase 3 delta."""
import hashlib,json,os,tarfile,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if os.name=='nt': ROOT=Path('\\\\?\\'+str(ROOT))
OLD='phase3-20261020-001'; NEW='phase45-20261020-001'
archive=ROOT/'artifacts/phase2-20261019-001.tar.gz'
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='c70837f9ce6f2bf6355a452d1186c620d4da6a9e0832addb9ba57755573c9f2e'
with tarfile.open(archive) as tar: old={e.name:tar.extractfile(e).read() for e in tar if e.isfile()}
prior=ROOT/f'artifacts/{OLD}-FTP-CHANGES.zip'
assert hashlib.sha256(prior.read_bytes()).hexdigest()=='2d7240c4d38bd134b50d35ac5a8e878b658909c08e95621ea2e8e2a92366f28a'
with zipfile.ZipFile(prior) as z:
    prefix=f'upload-private/kconnect-staging-private/releases/{OLD}/'
    for name in z.namelist():
        if name.startswith(prefix): old[name.removeprefix(prefix)]=z.read(name)
for name,digest in json.loads(old['manifest.json'])['files'].items(): assert hashlib.sha256(old[name]).hexdigest()==digest,name
assert (ROOT/'backend/composer.lock').read_bytes()==old['backend/composer.lock'],'Dependency changes require a different package strategy'
files={name:data for name,data in old.items() if name!='manifest.json'}
for folder in ['app','bootstrap','config','routes','public','database/migrations']:
    for path in (ROOT/'backend'/folder).rglob('*'):
        if path.is_file():
            rel='backend/'+path.relative_to(ROOT/'backend').as_posix()
            if not rel.startswith('backend/bootstrap/cache/'): files[rel]=path.read_bytes()
files['backend/release-id']=(NEW+'\n').encode()
manifest=json.loads(old['manifest.json'])
manifest.update(release=NEW,commit='uncommitted-phase45-worktree',bytes=sum(map(len,files.values())),files={n:hashlib.sha256(d).hexdigest() for n,d in sorted(files.items())})
files['manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode()
changed={n:d for n,d in files.items() if old.get(n)!=d}
prefix=f'upload-private/kconnect-staging-private/releases/{NEW}/'
entries={prefix+n:d for n,d in changed.items()}
entries['activate-last/current.json']=(json.dumps({'release':NEW,'previous':OLD,'schema_epoch':'phase2-baseline'},indent=2)+'\n').encode()
entries['sql/01_phase45_schema_check.sql']=(ROOT/'deployment/phase-45/01_phase45_schema_check.sql').read_bytes()
entries['UPLOAD_PHASE45.md']=(ROOT/'docs/phase-45/UPLOAD_PHASE45.md').read_bytes()
entries['CHANGES.json']=(json.dumps({'base_release':OLD,'new_release':NEW,'base_delta_sha256':hashlib.sha256(prior.read_bytes()).hexdigest(),'schema_change':False,'frontend_change':False,'dependency_change':False,'deleted_files':[],'files':[{'path':n,'action':'changed' if n in old else 'added','before_sha256':hashlib.sha256(old[n]).hexdigest() if n in old else None,'after_sha256':hashlib.sha256(d).hexdigest()} for n,d in sorted(changed.items())]},indent=2)+'\n').encode()
out=ROOT/'artifacts'/NEW; out.mkdir(exist_ok=True)
bundle=ROOT/f'artifacts/{NEW}-FTP-CHANGES.zip'
if bundle.exists(): raise SystemExit('Immutable ZIP exists; do not overwrite a delivered release')
with zipfile.ZipFile(bundle,'x',compression=zipfile.ZIP_DEFLATED) as z:
    for name,data in entries.items():
        target=out/name; target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data); z.writestr(name,data)
print(json.dumps({'release':NEW,'release_files':len(changed),'bytes':bundle.stat().st_size,'sha256':hashlib.sha256(bundle.read_bytes()).hexdigest()}))
