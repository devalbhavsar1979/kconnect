"""Rehearse the exact combined FTP delta, HTTP concurrency and unchanged React UI locally."""
import base64,concurrent.futures,hashlib,json,os,re,secrets,subprocess,tarfile,time,urllib.request,urllib.error,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; OLD='phase3-20261020-001'; NEW='phase45-20261020-001'
base=ROOT/'.runtime'/('p45-'+secrets.token_hex(4)); private=base/'private'; public=base/'public'; release=private/'releases'/NEW
source=ROOT/'artifacts/ftp-phase2-20261019-001'; bundle=ROOT/f'artifacts/{NEW}-FTP-CHANGES.zip'
def write(path,data):
    if os.name=='nt': path=Path('\\\\?\\'+str(path))
    path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(data)
db='kconnect_p45_'+secrets.token_hex(4)
args=[str(ROOT/'.runtime/mariadb/mariadb-11.4.9-winx64/bin/mariadb.exe'),'--host=127.0.0.1','--port=33079','--skip-ssl','--user=root','--password=synthetic-local-only']
def sql(text):
    r=subprocess.run(args,input=text,text=True,capture_output=True)
    if r.returncode: raise RuntimeError(r.stderr)
sql(f'CREATE DATABASE {db} CHARACTER SET utf8mb4 COLLATE utf8mb4_bin; USE {db};\n'+(source/'sql/01_schema.sql').read_text()+'\n'+(source/'sql/02_synthetic_data.sql').read_text())
archive=ROOT/'artifacts/phase2-20261019-001.tar.gz'
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='c70837f9ce6f2bf6355a452d1186c620d4da6a9e0832addb9ba57755573c9f2e'
with tarfile.open(archive) as tar:
    for item in tar:
        if item.isfile(): write(release/item.name,tar.extractfile(item).read())
for phase in [OLD,NEW]:
    with zipfile.ZipFile(ROOT/f'artifacts/{phase}-FTP-CHANGES.zip') as z:
        assert z.testzip() is None
        prefix=f'upload-private/kconnect-staging-private/releases/{phase}/'
        changes=json.loads(z.read('CHANGES.json'))
        for change in changes['files']:
            target=release/change['path']
            if change['before_sha256']: assert hashlib.sha256(target.read_bytes()).hexdigest()==change['before_sha256'],change['path']
            data=z.read(prefix+change['path']); assert hashlib.sha256(data).hexdigest()==change['after_sha256']; write(target,data)
        if phase==NEW:
            write(private/'current.json',z.read('activate-last/current.json'))
            sql(f'USE {db};\n'+z.read('sql/01_phase45_schema_check.sql').decode())
print('Exact Phase 3 baseline plus combined delta reconstructed.',flush=True)
for name,digest in json.loads((release/'manifest.json').read_text())['files'].items():
    path=release/name
    if os.name=='nt': path=Path('\\\\?\\'+str(path))
    assert hashlib.sha256(path.read_bytes()).hexdigest()==digest,name
for path in (source/'upload-public/app.kconnect.in').rglob('*'):
    if path.is_file(): write(public/path.relative_to(source/'upload-public/app.kconnect.in'),path.read_bytes())
(public/'index.php').write_text((public/'index.php').read_text().replace('/home/nljgfkqgux/kconnect-staging-private',private.as_posix()))
for part in ['app','framework/cache/data','framework/sessions','framework/views','logs']: (private/'shared/storage'/part).mkdir(parents=True,exist_ok=True)
(release/'backend/bootstrap/cache').mkdir(parents=True,exist_ok=True)
write(private/'shared/.env',('\n'.join(['APP_ENV=staging','APP_DEBUG=false','APP_URL=http://127.0.0.1:5515','APP_KEY=base64:'+base64.b64encode(secrets.token_bytes(32)).decode(),'DB_CONNECTION=mysql','DB_HOST=127.0.0.1','DB_PORT=33079','DB_DATABASE='+db,'DB_USERNAME=root','DB_PASSWORD=synthetic-local-only','JWT_SECRET_KEY='+secrets.token_hex(32),''])).encode())
router=base/'router.php'; router.write_text("<?php $root=realpath(__DIR__.'/public'); $asset=realpath($root.parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)); if ($asset && is_file($asset) && str_starts_with($asset,$root.DIRECTORY_SEPARATOR)) return false; require __DIR__.'/public/index.php';")
processes=[]; logs=[]
def req(path,method='GET',data=None,token=None,status=200,port=5515,content=None):
    headers={'Accept':'application/json'}
    if token: headers['Authorization']='Bearer '+token
    if data is not None:
        headers['Content-Type']=content or 'application/json'
        if not content: data=json.dumps(data).encode()
    try: response=urllib.request.urlopen(urllib.request.Request(f'http://127.0.0.1:{port}'+path,data=data,headers=headers,method=method),timeout=30)
    except urllib.error.HTTPError as e: response=e
    with response:
        body=response.read()
        if status is not None: assert response.status==status,(path,response.status,body[:200])
        if status is None: return response.status
        return json.loads(body) if body and 'application/json' in response.headers.get('Content-Type','') else body
try:
    for port in [5515,5516]:
        log=open(base/f'http-{port}.log','w'); logs.append(log)
        processes.append(subprocess.Popen([str(ROOT/'.runtime/php/php.exe'),'-d','upload_max_filesize=12M','-d','post_max_size=16M','-S',f'127.0.0.1:{port}','-t',str(public),str(router)],stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0))
    for _ in range(30):
        try: req('/health'); break
        except OSError: time.sleep(.2)
    password=re.search(r'^Password: (.+)$',(source/'LOCAL_TEST_LOGINS.txt').read_text(),re.M)[1]
    token=req('/api/v1/auth/login','POST',{'email':'super_admin@example.test','password':password})['access_token']
    org=req('/api/v1/admin/organisations','POST',{'organization_name':'Browser Institute','industry':'Education','organization_type':'INSTITUTE','state':'Gujarat'},token,status=201)
    payload={'title':'Browser Workshop','opportunity_type':'LECTURE','category':'Technical','session_structure':'SINGLE_SESSION','total_duration':'2 hours','duration_per_session':'2 hours','short_description':'Synthetic workshop','detailed_description':'Training content','event_date':'2026-11-10','language_of_delivery':'English','organization_id':org['id'],'delivery_modes':['ONLINE'],'tags':['PHP','SQL'],'skills_required':['PHP'],'target_audience':['COLLEGE_STUDENTS'],'venue_name':'Online','venue_location_type':'ONLINE','venue_address':'Synthetic venue','minimum_experience':'2 years','expertise_level':'EXPERIENCED','compensation_type':'PAID','fee_structure':'PER_SESSION','fee_amount':'1250.50'}
    ids={}
    for name in ['desktop','mobile','concurrency']:
        ids[name]=req('/api/v1/admin/opportunities','POST',dict(payload,title='Browser Workshop '+name),token,status=201)['id']
    boundary='p45'+secrets.token_hex(8)
    body=f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4 synthetic\r\n--{boundary}--\r\n'.encode()
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        statuses=list(pool.map(lambda i:req('/api/v1/admin/opportunities/'+ids['concurrency']+'/attachments','POST',body,token,status=None,port=5515+i%2,content='multipart/form-data; boundary='+boundary),range(6)))
    assert sorted(statuses)==[201]*5+[422],statuses
    assert len(req('/api/v1/admin/opportunities/'+ids['concurrency'],token=token)['attachments'])==5
    req('/api/v1/admin/opportunities/'+ids['concurrency'],'DELETE',token=token,status=204)
    print('Concurrent uploads: five accepted, sixth rejected; starting UI checks.',flush=True)
    env=os.environ.copy(); env.update(P45_URL='http://127.0.0.1:5515',P45_PASSWORD=password,P45_IDS=json.dumps(ids))
    result=subprocess.run(['node',str(ROOT/'tools/phase45_browser.cjs')],env=env,capture_output=True,text=True)
    if result.returncode: raise RuntimeError('UI validation failed: '+result.stderr)
    report={'exact_phase3_to_phase45_overlay':True,'all_manifest_hashes_verified':True,'existing_phase2_schema_and_seed':True,'concurrent_upload_limit':statuses,'unchanged_react_desktop_mobile':True,'artifact_sha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'scope':'Local PHP 8.4.26, MariaDB 11.4.9 and Edge; hosting acceptance pending'}
    (ROOT/'artifacts/phase45-validation.json').write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps(report,indent=2))
finally:
    for p in processes: p.terminate(); p.wait(timeout=10)
    for log in logs: log.close()
