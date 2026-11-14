const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function setup(api = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('lib/catalog-cache.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, Date, Map, Promise, require: name => {
    if (name === '@/lib/api') return { categoryApi: api, productApi: api };
    if (name === '@/lib/catalog-product') return { mapCatalogProduct: (row, name) => ({ ...row, categoryName: name }) };
    throw Error(name);
  } });
  return module.exports;
}
test('concurrent requests share work and subsequent reads reuse it', async () => {
  const cache = setup(); let calls = 0;
  const load = async () => { calls++; return ['product']; };
  const [a, b] = await Promise.all([cache.cachedRequest('products', load), cache.cachedRequest('products', load)]);
  assert.equal(a, b); await cache.cachedRequest('products', load); assert.equal(calls, 1);
});
test('failed requests can retry without caching the failure', async () => {
  const cache = setup(); let calls = 0;
  await assert.rejects(cache.cachedRequest('products', async () => { calls++; throw Error('offline'); }));
  assert.equal(await cache.cachedRequest('products', async () => { calls++; return 'ok'; }), 'ok');
  assert.equal(calls, 2);
});
test('category enrichment follows parents and shares requests across batches', async () => {
  let calls = 0;
  const cache = setup({ getCategories: async () => ({ data: [{ id: 'parent', name: 'Fashion' }] }), getCategoryById: async () => { calls++; return { data: { id: 'child', parentId: 'parent' } }; } });
  const [first, second] = await Promise.all([cache.enrichProducts([{ id: 'one', categoryId: 'child' }]), cache.enrichProducts([{ id: 'two', categoryId: 'child' }])]);
  assert.equal(first[0].categoryName, 'Fashion'); assert.equal(second[0].categoryName, 'Fashion'); assert.equal(calls, 1);
});
test('category failures do not discard products', async () => {
  const cache = setup({ getCategories: async () => { throw Error('offline'); }, getCategoryById: async () => { throw Error('offline'); } });
  const products = await cache.enrichProducts([{ id: 'one', categoryId: 'missing' }]);
  assert.equal(products[0].id, 'one');
});
test('refresh replaces stale snapshots and product merging removes duplicates', () => {
  const cache = setup(); cache.seedCache('catalog', ['old']); cache.saveCache('catalog', ['new']);
  assert.equal(cache.cachedValue('catalog')[0], 'new');
  const rows = cache.mergeProducts([{ id: 'one', price: 1 }], [{ id: 'one', price: 2 }, { id: 'two' }]);
  assert.equal(rows.length, 2); assert.equal(rows[0].price, 2);
});
