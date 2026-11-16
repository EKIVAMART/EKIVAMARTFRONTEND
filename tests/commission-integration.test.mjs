import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

function loadModule(path) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  runInNewContext(outputText, { exports });
  return exports;
}

const { getVendorPricingFields } = loadModule('lib/vendor-product-pricing.ts');
const { mapProduct } = loadModule('lib/data/landing-product.ts');

test('vendor edits without a new price omit both price and discount from the request', () => {
  const fields = getVendorPricingFields({ id: 'product', compareAtPrice: 0, discount: 9.09 });
  assert.deepEqual({ ...fields }, {});
});

test('vendor creation and repricing send the entered amount without a commission adjustment', () => {
  for (const compareAtPrice of [999.99, 1000, 4999.99, 5000, 9999.99, 10000]) {
    assert.deepEqual({ ...getVendorPricingFields({ compareAtPrice }) }, { compareAtPrice });
    assert.deepEqual(
      { ...getVendorPricingFields({ id: 'product', compareAtPrice, discount: 10 }) },
      { compareAtPrice, discount: 10 },
    );
  }
  assert.deepEqual(
    { ...getVendorPricingFields({ id: 'product', compareAtPrice: 5000 }) },
    { compareAtPrice: 5000, discount: 0 },
  );
});

test('the product mapper preserves the customer prices and returned discount percentage', () => {
  const raw = {
    id: 'product',
    price: { amount: 5000 },
    compareAtPrice: { amount: 5500 },
    discount: 10,
  };
  const product = mapProduct({ ...raw, discountPercentage: 9.09 });
  assert.equal(product.price, 5000);
  assert.equal(product.compareAtPrice, 5500);
  assert.equal(product.discountPercent, 9.09);
  assert.equal(mapProduct(raw).discountPercent, undefined);
});
