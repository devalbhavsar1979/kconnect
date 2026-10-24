"""Build a changed-files-only overlay against the shipped immutable Phase 2 artifact."""
import hashlib,json,os,tarfile,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if os.name=='nt': ROOT=Path('\\\\?\\'+str(ROOT))
OLD='phase2-20261019-001'; NEW='phase3-20261020-001'
archive=ROOT/f'artifacts/{OLD}.tar.gz'
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='c70837f9ce6f2bf6355a452d1186c620d4da6a9e0832addb9ba57755573c9f2e'
with tarfile.open(archive) as tar:
    old={entry.name:tar.extractfile(entry).read() for entry in tar if entry.isfile()}
assert (ROOT/'backend/composer.lock').read_bytes()==old['backend/composer.lock'], 'Dependencies changed; a code-only overlay is insufficient'
files={name:data for name,data in old.items() if name!='manifest.json'}
for folder in ['app','bootstrap','config','routes','public','database/migrations']:
    for path in (ROOT/'backend'/folder).rglob('*'):
        if path.is_file():
            rel='backend/'+path.relative_to(ROOT/'backend').as_posix()
            if not rel.startswith('backend/bootstrap/cache/'):
                files[rel]=path.read_bytes()
files['backend/release-id']=(NEW+'\n').encode()
manifest=json.loads(old['manifest.json'])
manifest.update(release=NEW,commit='uncommitted-phase3-worktree',bytes=sum(map(len,files.values())),files={n:hashlib.sha256(d).hexdigest() for n,d in sorted(files.items())})
files['manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode()
changed={n:d for n,d in files.items() if old.get(n)!=d}
out=ROOT/'artifacts'/NEW
out.mkdir(exist_ok=True)
target='upload-private/kconnect-staging-private/releases/'+NEW+'/'
entries={target+n:d for n,d in changed.items()}
entries['activate-last/current.json']=(json.dumps({'release':NEW,'previous':OLD,'schema_epoch':'phase2-baseline'},indent=2)+'\n').encode()
entries['sql/01_phase3_schema_check.sql']=(ROOT/'deployment/phase-3/01_phase3_schema_check.sql').read_bytes()
entries['UPLOAD_PHASE3.md']=(ROOT/'docs/phase-3/UPLOAD_PHASE3.md').read_bytes()
report={'base_release':OLD,'new_release':NEW,'base_archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'schema_change':False,'frontend_change':False,'dependency_change':False,'deleted_files':[], 'files':[{'path':n,'action':'changed' if n in old else 'added','before_sha256':hashlib.sha256(old[n]).hexdigest() if n in old else None,'after_sha256':hashlib.sha256(d).hexdigest()} for n,d in sorted(changed.items())]}
entries['CHANGES.json']=(json.dumps(report,indent=2)+'\n').encode()
bundle=ROOT/f'artifacts/{NEW}-FTP-CHANGES.zip'
if bundle.exists(): raise SystemExit('Immutable ZIP already exists; use a new build ID')
with zipfile.ZipFile(bundle,'x',compression=zipfile.ZIP_DEFLATED) as z:
    for name,data in entries.items():
        path=out/name; path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(data)
        z.writestr(name,data)
print(json.dumps({'zip':str(bundle),'sha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'release_files':len(changed),'bytes':bundle.stat().st_size}))
