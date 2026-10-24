"""Package the manual Phase 2.3 FTP delta from the immutable Phase 2.2 base."""
from pathlib import Path
import hashlib, json, tarfile, zipfile
ROOT = Path(__file__).resolve().parents[1]
OLD = 'phase22-20261023-001'
NEW = 'phase23-20261024-001'
def sha(data): return hashlib.sha256(data).hexdigest()
with tarfile.open(ROOT/'artifacts/phase2-20261019-001.tar.gz') as tar:
    files = {e.name: tar.extractfile(e).read() for e in tar if e.isfile()}
for release in ['phase3-20261020-001', 'phase45-20261020-001', 'phase21-20261022-001', OLD]:
    with zipfile.ZipFile(ROOT/f'artifacts/{release}-FTP-CHANGES.zip') as archive:
        prefix = f'upload-private/kconnect-staging-private/releases/{release}/'
        files.update({n[len(prefix):]: archive.read(n) for n in archive.namelist() if n.startswith(prefix)})
    manifest = json.loads(files['manifest.json'])
    for name, digest in manifest['files'].items():
        assert sha(files[name]) == digest, name
before = files.copy()
assert (ROOT/'backend/composer.lock').read_bytes() == files['backend/composer.lock']
for name in ['backend/app/Http/Controllers/OpportunityController.php', 'backend/app/Http/Controllers/AdministrationController.php', 'backend/database/migrations/2026_10_24_000001_unify_opportunity_responses.php', 'backend/database/migrations/2026_10_24_000002_correct_applied_status.php']:
    files[name] = (ROOT/name).read_bytes()
dist = ROOT/'frontend/dist'
assert (dist/'index.html').is_file() and (dist/'sw.js').is_file()
for p in dist.rglob('*'):
    if p.is_file(): files['backend/resources/spa/'+p.relative_to(dist).as_posix()] = p.read_bytes()
files['backend/release-id'] = (NEW+'\n').encode()
files.pop('manifest.json')
manifest.update(release=NEW, commit='uncommitted-phase23-worktree', bytes=sum(map(len,files.values())), files={n:sha(d) for n,d in sorted(files.items())}, required_additive_migrations=['2026_10_23_000001_create_saved_opportunities','2026_10_24_000001_unify_opportunity_responses','2026_10_24_000002_correct_applied_status'], deployment_method='manual-ftp')
files['manifest.json'] = (json.dumps(manifest,indent=2)+'\n').encode()
changed = {n:d for n,d in files.items() if before.get(n)!=d}
entries = {f'upload-private/kconnect-staging-private/releases/{NEW}/'+n:d for n,d in changed.items()}
for p in dist.rglob('*'):
    if p.is_file() and p.name != 'index.html': entries['upload-public/app.kconnect.in/'+p.relative_to(dist).as_posix()] = p.read_bytes()
entries['activate-last/current.json'] = (json.dumps(dict(release=NEW,previous=OLD,schema_epoch='phase2-baseline'),indent=2)+'\n').encode()
for name in ['01_unify_opportunity_responses.sql','02_verify_opportunity_responses.sql','03_correct_applied_status.sql']:
    entries['sql/'+name] = (ROOT/'deployment/phase-2.3'/name).read_text(encoding='utf-8-sig').encode()
entries['UPLOAD_PHASE23.md'] = (ROOT/'docs/phase-2.3/UPLOAD_PHASE23.md').read_text(encoding='utf-8-sig').encode()
entries['CHANGES.json'] = json.dumps(dict(base_release=OLD,new_release=NEW,base_delta_sha256=sha((ROOT/f'artifacts/{OLD}-FTP-CHANGES.zip').read_bytes()),schema_change=True,deleted_files=[],files={n:sha(d) for n,d in sorted(entries.items())}),indent=2).encode()
out=ROOT/f'artifacts/{NEW}-FTP-CHANGES.zip'
with zipfile.ZipFile(out,'x',zipfile.ZIP_DEFLATED) as z:
    for n,d in sorted(entries.items()): z.writestr(n,d)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    for n,d in entries.items(): assert z.read(n)==d
folder=out.with_suffix('')
folder.mkdir(exist_ok=False)
for n,d in entries.items():
    p=folder/n; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(d)
out.with_suffix('.zip.sha256').write_text(sha(out.read_bytes())+'  '+out.name+'\n')
print(json.dumps(dict(path=str(out),bytes=out.stat().st_size,entries=len(entries),sha256=sha(out.read_bytes())),indent=2))
