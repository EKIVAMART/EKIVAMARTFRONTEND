const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

const source = readFileSync(require.resolve('../lib/delivery-coverage.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const coverage = {};
runInNewContext(outputText, { exports: coverage, require: () => ({}) });

test('a rejection naming only the destination triggers a coverage refresh', () => {
  assert.equal(coverage.locationError('We do not currently deliver to Warri, Warri South (Delta).'), true);
  assert.equal(coverage.locationError('Payment initialization failed.'), false);
});

test('removing a delivery town clears that choice and preserves its valid parents', () => {
  const selected = { state: 'Delta', lga: 'Warri South', town: 'Warri' };
  const remaining = [{ state: 'Delta', lgas: [{ lga: 'Warri South', towns: [] }] }];
  const result = coverage.reconcileLocation(remaining, selected);
  assert.deepEqual({ ...result }, { ...selected, town: '' });
});
