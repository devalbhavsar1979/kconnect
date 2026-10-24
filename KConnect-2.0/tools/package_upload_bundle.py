"""Combine tested immutable release, private deployer and operator instructions."""
import argparse, hashlib, zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('release')
args=parser.parse_args()
archive=root/'artifacts'/args.release
if not archive.is_file() or not archive.name.endswith('.tar.gz'):
    raise SystemExit('Provide an existing artifacts/*.tar.gz filename')
out=archive.with_name(archive.name.removesuffix('.tar.gz')+'-upload.zip')
with zipfile.ZipFile(out,'x',compression=zipfile.ZIP_DEFLATED) as bundle:
    bundle.write(archive,'incoming/'+archive.name)
    bundle.write(str(archive)+'.sha256','incoming/'+archive.name+'.sha256')
    for file in ['deploy.php','ReleaseManager.php','smoke-auth.php']:
        bundle.write(root/'deployment'/file,'deployer/'+file)
    bundle.write(root/'deployment/staging.spaceship.json','staging.json')
    bundle.write(root/'backend/.env.example','shared/.env.example')
    bundle.write(root/'docs/phase-2/UPLOAD_AND_TEST.md','UPLOAD_AND_TEST.md')
print(str(out))
print('SHA256 '+hashlib.sha256(out.read_bytes()).hexdigest())
