const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const axios = require('axios');
const ts = require('typescript');

function setup(initialTokens, respond) {
  const requests = [];
  const storage = new Map(Object.entries(initialTokens));
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  const root = resolve(__dirname, '..');
  const modules = new Map();
  const transport = axios.create({
    adapter: async (config) => {
      const request = {
        method: config.method,
        url: config.url,
        authorization: config.headers.get('Authorization'),
        body: config.data ? JSON.parse(config.data) : undefined,
      };
      requests.push(request);
      const { status = 200, data = {} } = await respond(request);
      const response = { config, status, data, headers: {} };
      if (status >= 400) throw new axios.AxiosError('Request failed', undefined, config, undefined, response);
      return response;
    },
  });

  function load(file) {
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const source = ts.transpileModule(readFileSync(resolve(root, `${file}.ts`), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
      module,
      exports: module.exports,
      process: { env: { NEXT_PUBLIC_API_URL: 'https://api.example.test' } },
      window: {},
      localStorage,
      URLSearchParams,
      require(name) {
        if (name === 'axios') {
          return {
            create: (config) => axios.create({ ...config, adapter: transport.defaults.adapter }),
            post: transport.post,
          };
        }
        if (name.startsWith('@/')) return load(name.slice(2));
        if (name.startsWith('./')) return load(`lib/${name.slice(2)}`);
        return require(name);
      },
    });
    return module.exports;
  }

  const auth = load('lib/features/auth/authSlice');
  let state = auth.default(undefined, { type: '@@init' });
  load('lib/axios').injectStore({
    getState: () => ({ auth: state }),
    dispatch: (action) => { state = auth.default(state, action); },
  });

  return {
    requests,
    authApi: load('lib/api').authApi,
    adminVendorApi: load('lib/api-vendor').adminVendorApi,
  };
}

const refreshed = { accessToken: 'new-access', refreshToken: 'new-refresh' };

test('the vendor list sends only the access token to the protected endpoint', async () => {
  const { adminVendorApi, requests } = setup(
    { accessToken: 'existing-access', refreshToken: 'existing-refresh' },
    () => ({})
  );
  await adminVendorApi.listVendors({ status: 'approved', limit: 200 });
  assert.deepEqual(requests, [{
    method: 'get',
    url: '/admin/vendors?status=approved&limit=200',
    authorization: 'Bearer existing-access',
    body: undefined,
  }]);
});

test('vendor requests share refresh when only a refresh token is available', async () => {
  const { adminVendorApi, requests } = setup({ refreshToken: 'existing-refresh' }, ({ url }) =>
    url.endsWith('/auth/refresh') ? { data: { data: refreshed } } : {}
  );
  await Promise.all([adminVendorApi.listVendors(), adminVendorApi.listVendors()]);
  assert.equal(requests.filter(({ url }) => url.endsWith('/auth/refresh')).length, 1);
  assert.equal(requests.filter(({ authorization }) => authorization === 'Bearer new-access').length, 2);
});

test('the vendor list stays local when the session has no tokens', async () => {
  const { adminVendorApi, requests } = setup({}, () => ({}));
  await assert.rejects(adminVendorApi.listVendors(), /session has expired/);
  assert.deepEqual(requests, []);
});

test('logout sends the current refresh token alongside an expired access token', async () => {
  const { authApi, requests } = setup(
    { accessToken: 'expired-access', refreshToken: 'existing-refresh' },
    () => ({ data: { success: true } })
  );
  await authApi.logoutCurrentSession();
  assert.deepEqual(requests, [{
    method: 'post',
    url: '/auth/logout',
    authorization: 'Bearer expired-access',
    body: { refreshToken: 'existing-refresh' },
  }]);
});

test('logout can revoke the current session using only the refresh token', async () => {
  const { authApi, requests } = setup(
    { refreshToken: 'existing-refresh' },
    () => ({ data: { success: true } })
  );
  await authApi.logoutCurrentSession();
  assert.deepEqual(requests, [{
    method: 'post',
    url: '/auth/logout',
    authorization: undefined,
    body: { refreshToken: 'existing-refresh' },
  }]);
});

test('logout waits for a pending refresh before sending the rotated token', async () => {
  let notifyRefresh;
  let releaseRefresh;
  const refreshStarted = new Promise((resolve) => { notifyRefresh = resolve; });
  const finishRefresh = new Promise((resolve) => { releaseRefresh = resolve; });
  const { adminVendorApi, authApi, requests } = setup(
    { refreshToken: 'existing-refresh' },
    async ({ url }) => {
      if (url.endsWith('/auth/refresh')) {
        notifyRefresh();
        await finishRefresh;
        return { data: { data: refreshed } };
      }
      return { data: { success: true } };
    }
  );
  const listing = adminVendorApi.listVendors();
  await refreshStarted;
  const logout = authApi.logoutCurrentSession();
  releaseRefresh();
  await Promise.all([listing, logout]);
  assert.deepEqual(requests.find(({ url }) => url === '/auth/logout'), {
    method: 'post',
    url: '/auth/logout',
    authorization: 'Bearer new-access',
    body: { refreshToken: 'new-refresh' },
  });
});
