"""Rehearse the FTP payload without Artisan, Composer or SSH at deployment time."""
import base64
import hashlib
import json
import os
import re
import secrets
import subprocess
import time
import urllib.request
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'artifacts/ftp-phase2-20261019-001'
bundle=ROOT/'artifacts/phase2-20261019-001-FTP.zip'
php=ROOT/'.runtime/php/php.exe'
client=ROOT/'.runtime/mariadb/mariadb-11.4.9-winx64/bin/mariadb.exe'
dbname='kconnect_ftp_files_'+secrets.token_hex(4)
args=[str(client),'--host=127.0.0.1','--port=33079','--skip-ssl','--user=root','--password=synthetic-local-only']
def sql(text, database=None):
    result=subprocess.run(args+([database] if database else []),input=text,encoding='utf-8',capture_output=True)
    if result.returncode: raise RuntimeError('Local SQL import failed: '+result.stderr)
    return result.stdout
sql('CREATE DATABASE '+dbname+' CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;')
sql((source/'sql/01_schema.sql').read_text(encoding='utf-8'),dbname)
sql((source/'sql/02_synthetic_data.sql').read_text(encoding='utf-8'),dbname)
sql((source/'sql/02_synthetic_data.sql').read_text(encoding='utf-8'),dbname)
base=ROOT/'.runtime'/('ftp-check-'+secrets.token_hex(4))
private=base/'private'
public=base/'public'
with zipfile.ZipFile(bundle) as archive:
    assert archive.testzip() is None
    assert not any(n.endswith('/.env') or 'LOCAL_TEST_LOGINS' in n for n in archive.namelist())
    hashes=json.loads(archive.read('SHA256SUMS.json'))
    for name,digest in hashes.items(): assert hashlib.sha256(archive.read(name)).hexdigest()==digest
    for item in archive.infolist():
        if item.filename.startswith('upload-private/kconnect-staging-private/'):
            target=private/item.filename.removeprefix('upload-private/kconnect-staging-private/')
        elif item.filename.startswith('upload-public/app.kconnect.in/'):
            target=public/item.filename.removeprefix('upload-public/app.kconnect.in/')
        else: continue
        if os.name=='nt': target=Path('\\\\?\\'+str(target))
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(archive.read(item))
    (private/'current.json').write_bytes(archive.read('activate-last/current.json'))
index=public/'index.php'
index.write_text(index.read_text().replace('/home/nljgfkqgux/kconnect-staging-private',private.as_posix()))
readiness=secrets.token_hex(32)
(private/'shared/.env').write_text('\n'.join([
    'APP_ENV=staging','APP_DEBUG=false','APP_URL=http://127.0.0.1:5513',
    'APP_KEY=base64:'+base64.b64encode(secrets.token_bytes(32)).decode(),
    'DB_CONNECTION=mysql','DB_HOST=127.0.0.1','DB_PORT=33079','DB_DATABASE='+dbname,
    'DB_USERNAME=root','DB_PASSWORD=synthetic-local-only','JWT_SECRET_KEY='+secrets.token_hex(32),
    'READINESS_TOKEN='+readiness,'PHASE2_SYNTHETIC_DATABASE=true',''
]),encoding='utf-8')
log=open(base/'http.log','w',encoding='utf-8')
process=subprocess.Popen([str(php),'-S','127.0.0.1:5513','-t',str(public),str(index)],stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
def request(path,data=None,token=None,extra=None):
    headers={'Accept':'application/json',**(extra or {})}
    if token: headers['Authorization']='Bearer '+token
    if data is not None: headers['Content-Type']='application/json'
    req=urllib.request.Request('http://127.0.0.1:5513'+path,data=json.dumps(data).encode() if data is not None else None,headers=headers)
    with urllib.request.urlopen(req,timeout=10) as response: return json.load(response)
try:
    for attempt in range(20):
        try:
            assert request('/health')=={'status':'healthy'}
            break
        except (OSError,AssertionError): time.sleep(0.25)
    else: raise RuntimeError('FTP bootstrap did not start; inspect local HTTP log')
    assert request('/internal/readiness',extra={'X-Readiness-Token':readiness})['status']=='ready'
    password=re.search(r'^Password: (.+)$',(source/'LOCAL_TEST_LOGINS.txt').read_text(),re.M)[1]
    for role in ['SME','PROFESSIONAL_SERVICE_PROVIDER','ADMIN','SUPER_ADMIN','FREELANCER']:
        tokens=request('/api/v1/auth/login',{'email':role.lower()+'@example.test','password':password})
        user=request('/api/v1/auth/me',token=tokens['access_token'])
        assert user['user_type']==role and 'password_hash' not in user
    run=subprocess.run([str(php),str(ROOT/'deployment/smoke-auth.php'),'http://127.0.0.1:5513'],capture_output=True,text=True)
    if run.returncode: raise RuntimeError('FTP HTTP smoke failed: '+run.stderr)
    report={'schema_import_from_files':True,'seed_import_runs':2,'all_five_seed_logins':True,'readiness':True,'http_smoke_checks':14,'server_commands_at_deploy':False,'bundle_sha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'scope':'Local MariaDB 11.4.9 and PHP 8.4; no hosted LiteSpeed or FTP transfer claim'}
    (ROOT/'artifacts/ftp-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
finally:
    process.terminate()
    process.wait(timeout=10)
    log.close()
