// Verify that the three compile-only fixes do not change emitted JavaScript.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'frontend/node_modules/typescript'));
const allowed = new Set([
  'src/types/index.ts',
  'src/features/admin/components/organisation/OrgIdentitySection.tsx',
  'src/features/profile/components/PersonalInfoCard.tsx',
]);
const legacy = path.join(root, 'baseline/legacy/frontend');
let count = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const source = path.join(dir, entry.name);
    const relative = path.relative(legacy, source).split(path.sep).join('/');
    if (entry.isDirectory()) { walk(source); continue; }
    const target = path.join(root, 'frontend', relative);
    assert(fs.existsSync(target), `Missing frontend file ${relative}`);
    const before = fs.readFileSync(source);
    const after = fs.readFileSync(target);
    if (!before.equals(after)) {
      assert(allowed.has(relative), `Unapproved frontend change ${relative}`);
      const emit = input => ts.transpileModule(input.toString(), {compilerOptions: {jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, removeComments: true}, fileName: relative}).outputText;
      assert.strictEqual(emit(before), emit(after), `Runtime JavaScript changed ${relative}`);
    }
    count++;
  }
}
walk(legacy);
console.log(`PASS: ${count} legacy frontend files checked; compile-only fixes emit identical JavaScript.`);
