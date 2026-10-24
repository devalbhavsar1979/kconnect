"""Exercise the actual FTP overlay on a fresh local MariaDB Phase 2 installation."""
import base64, hashlib, http.cookiejar, json, os, re, secrets, subprocess, time
import urllib.request, urllib.error, zipfile, tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = 'phase2-20261019-001'
NEW = 'phase3-20261020-001'
source = ROOT / ('artifacts/ftp-' + OLD)
bundle = ROOT / f'artifacts/{NEW}-FTP-CHANGES.zip'
base = ROOT / '.runtime' / ('p3-check-' + secrets.token_hex(4))
private, public = base / 'private', base / 'public'
db = 'kconnect_p3_http_' + secrets.token_hex(4)
client = ROOT / '.runtime/mariadb/mariadb-11.4.9-winx64/bin/mariadb.exe'
def sql(statement):
    run = subprocess.run([str(client), '--host=127.0.0.1', '--port=33079', '--skip-ssl', '--user=root', '--password=synthetic-local-only'], input=statement, capture_output=True, text=True)
    if run.returncode: raise RuntimeError(run.stderr)
    return run.stdout
sql(f'CREATE DATABASE {db} CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;')
sql(f'USE {db};\n' + (source/'sql/01_schema.sql').read_text() + '\n' + (source/'sql/02_synthetic_data.sql').read_text())
def write(path, data):
    if os.name == 'nt': path = Path('\\\\?\\' + str(path))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
archive = ROOT / f'artifacts/{OLD}.tar.gz'
assert hashlib.sha256(archive.read_bytes()).hexdigest() == 'c70837f9ce6f2bf6355a452d1186c620d4da6a9e0832addb9ba57755573c9f2e'
with tarfile.open(archive) as tar:
    for entry in tar:
        if entry.isfile(): write(private/'releases'/NEW/entry.name, tar.extractfile(entry).read())
for path in (source/'upload-public/app.kconnect.in').rglob('*'):
    if path.is_file(): write(public/path.relative_to(source/'upload-public/app.kconnect.in'),path.read_bytes())
for directory in ['app','framework/cache','framework/sessions','framework/views','logs']:
    (private/'shared/storage'/directory).mkdir(parents=True,exist_ok=True)
(private/'releases'/NEW/'backend/bootstrap/cache').mkdir(parents=True,exist_ok=True)
print('Phase 2 installation reconstructed; applying delta and verifying manifest.',flush=True)
with zipfile.ZipFile(bundle) as z:
    assert z.testzip() is None
    changes = json.loads(z.read('CHANGES.json'))
    release = private/'releases'/NEW
    for item in changes['files']:
        target = release/item['path']
        if item['before_sha256']:
            assert hashlib.sha256(target.read_bytes()).hexdigest() == item['before_sha256']
        data = z.read('upload-private/kconnect-staging-private/releases/'+NEW+'/'+item['path'])
        assert hashlib.sha256(data).hexdigest() == item['after_sha256']
        write(target, data)
    write(private/'current.json', z.read('activate-last/current.json'))
    sql(f'USE {db};\n' + z.read('sql/01_phase3_schema_check.sql').decode())
    for name, digest in json.loads((release/'manifest.json').read_text())['files'].items():
        target = release/name
        if os.name == 'nt': target = Path('\\\\?\\'+str(target))
        assert hashlib.sha256(target.read_bytes()).hexdigest() == digest, name
index = public/'index.php'
print('All release hashes verified; starting HTTP and browser checks.',flush=True)
index.write_text(index.read_text().replace('/home/nljgfkqgux/kconnect-staging-private', private.as_posix()))
url = 'http://127.0.0.1:5514'
write(private/'shared/.env', ('\n'.join(['APP_ENV=staging','APP_DEBUG=false','APP_URL='+url,'APP_KEY=base64:'+base64.b64encode(secrets.token_bytes(32)).decode(),'DB_CONNECTION=mysql','DB_HOST=127.0.0.1','DB_PORT=33079','DB_DATABASE='+db,'DB_USERNAME=root','DB_PASSWORD=synthetic-local-only','JWT_SECRET_KEY='+secrets.token_hex(32),'READINESS_TOKEN='+secrets.token_hex(32),''])).encode())
jar = http.cookiejar.CookieJar()
owner = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
other = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def req(path, method='GET', data=None, token=None, browser=owner, content=None, status=200):
    headers = {'Accept':'application/json'}
    if token: headers['Authorization'] = 'Bearer '+token
    if data is not None:
        headers['Content-Type'] = content or 'application/json'
        if not content: data = json.dumps(data).encode()
    try: response = browser.open(urllib.request.Request(url+path,data=data,headers=headers,method=method),timeout=15)
    except urllib.error.HTTPError as e: response = e
    with response:
        body = response.read()
        assert response.status == status, (path,response.status,body[:300])
        return json.loads(body) if 'application/json' in response.headers.get('Content-Type','') and body else body
def multipart(fields, file=None):
    boundary='phase3'+secrets.token_hex(12)
    body=b''
    for name,value in fields.items():
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
    if file:
        name,filename,mime,data=file
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\nContent-Type: {mime}\r\n\r\n'.encode()+data+b'\r\n'
    return body+f'--{boundary}--\r\n'.encode(),'multipart/form-data; boundary='+boundary
def form(path, method, fields, token, file=None, status=200):
    body,content=multipart(fields,file)
    return req(path,method,body,token,content=content,status=status)
log = open(base/'http.log','w')
router=base/'router.php'
router.write_text("<?php $root=realpath(__DIR__.'/public'); $asset=realpath($root.parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)); if ($asset && is_file($asset) && str_starts_with($asset,$root.DIRECTORY_SEPARATOR)) return false; require __DIR__.'/public/index.php';")
process = subprocess.Popen([str(ROOT/'.runtime/php/php.exe'),'-d','upload_max_filesize=12M','-d','post_max_size=16M','-S','127.0.0.1:5514','-t',str(public),str(router)],stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
try:
    for _ in range(30):
        try:
            req('/health'); break
        except OSError: time.sleep(.25)
    password=re.search(r'^Password: (.+)$',(source/'LOCAL_TEST_LOGINS.txt').read_text(),re.M)[1]
    tokens=req('/api/v1/auth/login','POST',{'email':'sme@example.test','password':password})
    token=tokens['access_token']
    req('/api/v1/auth/login','POST',{'email':'freelancer@example.test','password':password},browser=other)
    assert any(c.name=='kconnect_files' and c.path=='/uploads' for c in jar)
    req('/api/v1/auth/me',status=403)  # File cookie is NOT API authentication.
    prefix='/api/v1/users/me/'
    png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY1sAAAAASUVORK5CYII=')
    photo=form(prefix+'profile/photo','POST',{},token,('photo','tiny.png','image/png',png))['profile_photo_path']
    assert req('/'+photo)==png
    req('/'+photo,browser=other,status=404)
    entry=form(prefix+'achievements','POST',{'title':'Synthetic certificate','description':'HTTP fixture'},token,('file','original.pdf','application/pdf',b'%PDF-1.4 original'),201)
    changed=form(prefix+'achievements/'+entry['id'],'PUT',{'title':'Updated certificate'},token,('file','replacement.pdf','application/pdf',b'%PDF-1.4 replacement'))
    assert changed['title']=='Updated certificate' and changed['file_path']!=entry['file_path']
    assert req('/'+changed['file_path'])==b'%PDF-1.4 replacement'
    req('/'+entry['file_path'],status=404)
    req('/'+changed['file_path'],browser=other,status=404)
    cleared=form(prefix+'achievements/'+entry['id'],'PUT',{'clear_file':'true'},token)
    assert cleared['file_path'] is None
    req('/'+changed['file_path'],status=404)
    req(prefix+'achievements/'+entry['id'],'DELETE',token=token,status=204)
    req(prefix+'academic','POST',{'school':'Synthetic University','degree':'BSc','end_year':2020},token,status=201)
    # Existing unchanged React is tested against the exact staged package.
    env=os.environ.copy(); env.update(P3_URL=url,P3_EMAIL='sme@example.test',P3_PASSWORD=password)
    run=subprocess.run(['node',str(ROOT/'tools/phase3_browser.cjs')],env=env,capture_output=True,text=True)
    if run.returncode: raise RuntimeError('Browser validation: '+run.stderr)
    req('/api/v1/auth/logout','POST',{'refresh_token':tokens['refresh_token']},token,status=204)
    req('/'+photo,status=404)
    cv_password=secrets.token_hex(16)
    cv_tokens=form('/api/v1/auth/register','POST',{'first_name':'Synthetic','last_name':'CV','email':'cv@example.test','password':cv_password,'confirm_password':cv_password,'user_type':'SME'},None,('cv','resume.pdf','application/pdf',b'%PDF-1.4 synthetic CV'),201)
    cv_path=req('/api/v1/auth/me',token=cv_tokens['access_token'])['cv_file_path']
    assert req('/'+cv_path)==b'%PDF-1.4 synthetic CV'
    req('/'+cv_path,browser=other,status=404)
    report={'baseline_copy_and_delta_hashes':True,'entire_release_manifest_verified':True,'phase2_sql_and_existing_seed_preserved':True,'real_http_multipart_put_replace_and_clear':True,'cookie_only_native_file_access':True,'cross_account_files_denied':True,'file_cookie_cannot_authenticate_api':True,'logout_clears_file_access':True,'phase2_cv_registration_and_private_download':True,'unchanged_react_desktop_mobile':True,'bundle_sha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'scope':'Local PHP 8.4.26 and MariaDB 11.4.9; hosted LiteSpeed acceptance still required'}
    (ROOT/'artifacts/phase3-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
finally:
    process.terminate(); process.wait(timeout=10); log.close()
