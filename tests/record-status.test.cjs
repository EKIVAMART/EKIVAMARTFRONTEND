const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');

// Compile the actual TSX component with the project's existing TypeScript dependency.
const source = readFileSync(resolve(__dirname, '../components/admin/RecordStatus.tsx'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
const componentModule = { exports: {} };
runInNewContext(outputText, { exports: componentModule.exports, require });
const RecordStatus = componentModule.exports.default;
const render = (value, children) => renderToStaticMarkup(React.createElement(RecordStatus, { value }, children));

test('legacy waitlist records with a null role render a neutral placeholder', () => {
  assert.match(render(null), /text-slate-700/);
  assert.match(render(null), />—<\/span>/);
});

test('missing and blank status values render without throwing', () => {
  for (const value of [undefined, '', '   ']) assert.match(render(value), />—<\/span>/);
});

test('existing roles, status labels and status colors remain intact', () => {
  assert.match(render('customer'), />Customer<\/span>/);
  assert.match(render('vendor'), />Vendor<\/span>/);
  assert.match(render('pending_payment'), /text-amber-800.*>Pending payment<\/span>/);
  assert.match(render('payment-failed'), /text-red-700.*>Payment failed<\/span>/);
  assert.match(render('active'), /text-slate-700.*>Active<\/span>/);
  assert.match(render(null, 'Not provided'), />Not provided<\/span>/);
});
