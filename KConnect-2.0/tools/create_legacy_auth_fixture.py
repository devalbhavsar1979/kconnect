"""Public synthetic interoperability fixture; never use its key/password in deployment."""
import json
from pathlib import Path
from passlib.context import CryptContext
from jose import jwt
root=Path(__file__).resolve().parents[1]
key='synthetic-legacy-test-key-never-deploy-00001'
password='SyntheticBcrypt123!'
data={'key':key,'password':password,'password_hash':CryptContext(schemes=['bcrypt']).hash(password),
      'token':jwt.encode({'sub':'20000000-0000-4000-8000-000000000001','type':'access','user_type':'SME','exp':2208988800},key,algorithm='HS256')}
out=root/'backend/tests/fixtures/legacy-auth.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print('Created synthetic Python passlib/python-jose interoperability fixture')
