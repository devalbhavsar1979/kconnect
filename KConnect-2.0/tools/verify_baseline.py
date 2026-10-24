"""Verify evidence coverage and legacy preservation; not an application test suite."""
import ast
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
from discover import OLD, NEW, OUT, legacy_manifest, read


def load(name):
    return json.loads(read(OUT / name))


def main():
    routes = load("api-inventory.json")
    cases = load("contract-capture-matrix.json")
    ui = load("ui-inventory.json")
    models = load("model-inventory.json")
    assert len(routes) == 59
    assert {(r['method'], r['path']) for r in routes} == {tuple(c['id'].split(' ', 1)) for c in cases}
    assert all(c['observed_response'] is None and c['capture_status'] == 'pending-runtime' for c in cases)
    assert len(ui) == 40
    route_source = read(OLD / 'frontend/src/routes/index.tsx')
    assert {r['path'] for r in ui} == set(re.findall(r"path:\s*'([^']+)'", route_source))
    assert sum(bool(m['table']) for m in models) == 13
    for item in routes + ui + models + load('schema-inventory.json'):
        path, line = item['source'].rsplit(':', 1)
        assert (OLD / path).is_file() and int(line) > 0
    fixtures = json.loads(read(NEW / 'docs/fixtures/source-contract-examples.json'))
    keys = {(r['method'], r['path']): r for r in routes}
    for fixture in fixtures['cases']:
        assert (fixture['method'], fixture['path']) in keys
        tree = ast.parse(read(OLD / fixture['source']))
        literals = [n.value for n in ast.walk(tree) if isinstance(n, ast.Constant) and isinstance(n.value, str)]
        body = fixture['response']
        if isinstance(body, dict):
            for value in body.values():
                if isinstance(value, str):
                    assert value in literals, f"Fixture value no longer in source: {value}"
    assert legacy_manifest() == load('legacy-source-hashes.json'), 'Legacy source changed'
    print('PASS: 59 API operations, 40 UI routes, 13 tables, complete capture-matrix coverage, fixture source references, and unchanged legacy source hashes.')
    print('NOT VERIFIED: runtime behavior, hosting capabilities, screenshots, production data or performance.')


if __name__ == '__main__':
    main()
