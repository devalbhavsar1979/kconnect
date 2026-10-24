"""Retry only browser checks against a previously hash-verified local rehearsal."""
import os,re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
name=sys.argv[1]
assert re.fullmatch('p3-check-[0-9a-f]{8}',name)
base=root/'.runtime'/name
assert (base/'private/current.json').is_file()
env=os.environ.copy()
env.update(P3_URL='http://127.0.0.1:5514',P3_EMAIL='sme@example.test',P3_PASSWORD=re.search(r'^Password: (.+)$',(root/'artifacts/ftp-phase2-20261019-001/LOCAL_TEST_LOGINS.txt').read_text(),re.M)[1])
with open(base/'http-retry.log','w') as log:
    router=base/'router.php'
    router.write_text("<?php $root=realpath(__DIR__.'/public'); $asset=realpath($root.parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)); if ($asset && is_file($asset) && str_starts_with($asset,$root.DIRECTORY_SEPARATOR)) return false; require __DIR__.'/public/index.php';")
    process=subprocess.Popen([str(root/'.runtime/php/php.exe'),'-d','upload_max_filesize=12M','-d','post_max_size=16M','-S','127.0.0.1:5514','-t',str(base/'public'),str(router)],stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
    try: sys.exit(subprocess.run(['node',str(root/'tools/phase3_browser.cjs')],env=env).returncode)
    finally: process.terminate(); process.wait(timeout=10)
