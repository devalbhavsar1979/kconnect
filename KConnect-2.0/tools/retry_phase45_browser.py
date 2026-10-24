"""Repeat browser checks on an already verified local synthetic rehearsal."""
import json,os,re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]; name=sys.argv[1]
assert re.fullmatch('p45-[0-9a-f]{8}',name)
base=root/'.runtime'/name
db=re.search(r'^DB_DATABASE=(kconnect_p45_[0-9a-f]{8})$',(base/'private/shared/.env').read_text(),re.M)[1]
client=root/'.runtime/mariadb/mariadb-11.4.9-winx64/bin/mariadb.exe'
rows=subprocess.run([str(client),'--host=127.0.0.1','--port=33079','--skip-ssl','--user=root','--password=synthetic-local-only','--skip-column-names',db,'--execute',"SELECT id,title FROM opportunities WHERE title LIKE 'Published Workshop %';"],capture_output=True,text=True,check=True).stdout.splitlines()
ids={line.split('\t')[1].split()[-1]:line.split('\t')[0] for line in rows}
assert set(ids)=={'desktop','mobile'}
password=re.search(r'^Password: (.+)$',(root/'artifacts/ftp-phase2-20261019-001/LOCAL_TEST_LOGINS.txt').read_text(),re.M)[1]
env=os.environ.copy(); env.update(P45_URL='http://127.0.0.1:5515',P45_PASSWORD=password,P45_IDS=json.dumps(ids))
with open(base/'browser-retry.log','w') as log:
    process=subprocess.Popen([str(root/'.runtime/php/php.exe'),'-S','127.0.0.1:5515','-t',str(base/'public'),str(base/'router.php')],stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
    try: sys.exit(subprocess.run(['node',str(root/'tools/phase45_browser.cjs')],env=env).returncode)
    finally: process.terminate(); process.wait(timeout=10)
