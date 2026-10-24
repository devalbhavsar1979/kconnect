"""Load only the isolated legacy copy and capture actual FastAPI schemas.

No database connection or HTTP server is needed. Import-time upload directories
are confined to the new workspace. This is schema validation, not workflow testing.
"""
import json
import os
import platform
import secrets
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
COPY = ROOT / 'baseline/legacy/backend'
OUT = ROOT / 'docs/phase-0/generated'
os.chdir(COPY)
sys.path.insert(0, str(COPY))
os.environ['DATABASE_URL'] = 'postgresql+psycopg://synthetic:unused@127.0.0.1:1/phase0_no_connection'
os.environ['JWT_SECRET_KEY'] = secrets.token_hex(32)
os.environ['ENVIRONMENT'] = 'development'

from app.main import app
from app.core.database import engine
from sqlalchemy import event


@event.listens_for(engine, 'do_connect')
def prohibit_database(*args, **kwargs):
    raise RuntimeError('Database access is forbidden during OpenAPI capture')


schema = app.openapi()
observed = {(method.upper(), path) for path, item in schema['paths'].items()
            for method in item if method in {'get', 'post', 'put', 'patch', 'delete'}}
expected = {(item['method'], item['path']) for item in json.loads((OUT / 'api-inventory.json').read_text(encoding='utf-8'))}
assert observed == expected, {'missing': sorted(expected-observed), 'extra': sorted(observed-expected)}
(OUT / 'runtime-openapi.json').write_text(json.dumps(schema, indent=2) + '\n', encoding='utf-8')
report = {'python': platform.python_version(), 'declared_target_python': '3.12',
          'scope': 'Isolated app import and FastAPI OpenAPI generation; no database or HTTP workflow execution',
          'operation_count': len(observed), 'source_inventory_match': True,
          'runtime_version_difference': 'Python 3.11 used for discovery; not a claim of Python 3.12 parity'}
(OUT / 'runtime-openapi-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
