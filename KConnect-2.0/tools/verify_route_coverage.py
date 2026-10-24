"""Compare concrete Laravel routes with the frozen FastAPI OpenAPI inventory."""
import json,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
run=subprocess.run([str(root/'.runtime/php/php.exe'),'artisan','route:list','--json'],cwd=root/'backend',capture_output=True,text=True,check=True)
normalize=lambda p:re.sub(r'\{[^}]+\}','{}',p.strip('/'))
actual={method+' '+normalize(r['uri']):r for r in json.loads(run.stdout) for method in r['method'].split('|')}
spec=json.loads((root/'docs/phase-0/generated/runtime-openapi.json').read_text())
rows=[]
for path,ops in spec['paths'].items():
    for method,operation in ops.items():
        if method not in ['get','post','put','patch','delete']: continue
        key=method.upper()+' '+normalize(path); assert key in actual,key
        route=actual[key]
        assert route['uri']!='api/{path?}'
        role=next((m for m in route['middleware'] if m.startswith('role:')), 'bearer' if 'bearer' in route['middleware'] else 'public/token exchange')
        rows.append(f"| {method.upper()} | `{path}` | {route['action'].replace('App'+chr(92)+'Http'+chr(92)+'Controllers'+chr(92),'')} | {role} |")
assert len(rows)==59
output='# API route coverage\n\nAll 59 frozen legacy operations have concrete routes. RouteCoverageTest additionally checks authentication middleware and unauthenticated denial for every protected operation. This mapping is not a claim of byte-for-byte captured FastAPI response parity.\n\n| Method | Legacy path | Laravel handler | Access |\n|---|---|---|---|\n'+'\n'.join(rows)+'\n'
(root/'docs/phase-45/API_COVERAGE.md').write_text(output)
print('PASS: all 59 legacy operations mapped to concrete handlers.')
