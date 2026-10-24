"""Read isolated SQLAlchemy metadata without connecting; emit baseline migration."""
import os, sys, json, importlib
from pathlib import Path
sys.dont_write_bytecode = True
root = Path(__file__).resolve().parents[1]
legacy = root / 'baseline/legacy/backend'
sys.path.insert(0, str(legacy))
os.environ['DATABASE_URL'] = 'postgresql+psycopg://synthetic:unused@127.0.0.1:1/unused'
os.environ['JWT_SECRET_KEY'] = 'schema-discovery-only-not-a-real-secret'
from app.core.database import Base
for source in (legacy / 'app/models').glob('*.py'):
    importlib.import_module('app.models.' + source.stem)
from sqlalchemy import UniqueConstraint
from sqlalchemy import types as t
from sqlalchemy.dialects.postgresql import ARRAY, UUID
def quote(v):
    return "'" + str(v).replace('\\', '\\\\').replace("'", "\\'") + "'"
lines = ['<?php', 'use Illuminate\\Database\\Migrations\\Migration;', 'use Illuminate\\Database\\Schema\\Blueprint;', 'use Illuminate\\Support\\Facades\\Schema;', 'return new class extends Migration {', 'public function up(): void {']
report = {}
for table in Base.metadata.sorted_tables:
    lines.append('Schema::create('+quote(table.name)+', function (Blueprint $table) {')
    lines.append("$table->charset = 'utf8mb4'; $table->collation = 'utf8mb4_bin';")
    report[table.name] = []
    for c in table.columns:
        ty = c.type
        args = quote(c.name)
        if isinstance(ty, UUID): method = 'uuid'
        elif isinstance(ty, ARRAY): method = 'json'
        elif isinstance(ty, t.Enum): method = 'enum'; args += ', ['+', '.join(map(quote,ty.enums))+']'
        elif isinstance(ty, t.Text): method = 'text'
        elif isinstance(ty, t.String): method = 'string'; args += ', '+str(ty.length or 255)
        elif isinstance(ty, t.Boolean): method = 'boolean'
        elif isinstance(ty, t.Integer): method = 'integer'
        elif isinstance(ty, t.Numeric): method = 'decimal'; args += f', {ty.precision}, {ty.scale}'
        elif isinstance(ty, t.DateTime): method = 'dateTime'; args += ', 6'
        elif isinstance(ty, t.Date): method = 'date'
        elif isinstance(ty, t.Time): method = 'time'; args += ', 6'
        else: raise ValueError(str(ty))
        expr = f'$table->{method}({args})'
        if c.nullable: expr += '->nullable()'
        if c.primary_key: expr += '->primary()'
        if c.server_default and isinstance(ty,t.DateTime): expr += '->useCurrent()'
        if c.default and c.default.is_scalar:
            value = c.default.arg
            if hasattr(value,'value'): value = value.value
            val = ('true' if value else 'false') if isinstance(value,bool) else str(value) if isinstance(value,(int,float)) else quote(value)
            expr += '->default('+val+')'
        lines.append(expr+';')
        report[table.name].append({'name':c.name,'source':str(ty),'target':method,'nullable':c.nullable})
    for constraint in table.constraints:
        if isinstance(constraint,UniqueConstraint): lines.append('$table->unique(['+', '.join(quote(c.name) for c in constraint.columns)+']);')
    for index in table.indexes:
        lines.append('$table->'+('unique' if index.unique else 'index')+'(['+', '.join(quote(c.name) for c in index.columns)+']);')
    for fk in table.foreign_keys:
        target, col = fk.target_fullname.split('.')
        lines.append('$table->foreign('+quote(fk.parent.name)+')->references('+quote(col)+')->on('+quote(target)+')->onDelete('+quote((fk.ondelete or 'RESTRICT').lower())+');')
    lines.append('});')
lines += ['}', 'public function down(): void {']
lines += ['Schema::dropIfExists('+quote(table.name)+');' for table in reversed(Base.metadata.sorted_tables)]
lines += ['}', '};', '']
out = root/'backend/database/migrations/2026_10_19_000001_create_domain_schema.php'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text('\n'.join(lines),encoding='utf-8')
docs=root/'docs/phase-2'; docs.mkdir(parents=True,exist_ok=True)
(docs/'schema-mapping.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(f'Exported {len(report)} tables, {sum(map(len,report.values()))} columns')
