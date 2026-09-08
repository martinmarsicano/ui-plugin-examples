const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const packageRoot = path.resolve(__dirname, '..');
const plain = (value) => JSON.parse(JSON.stringify(value));
const defaultExport = (value) => ({ __esModule: true, default: value });

// Exercise the real extension modules with only the Dashboard/browser boundary mocked.
// Tests are CommonJS so the extension's TypeScript and webpack entry points exclude them.
function extensionLoader({ mocks = {}, globals = {} } = {}) {
  const cache = new Map();
  const externals = {
    '@shell/utils/position': { RIGHT: 'right', LEFT: 'left', BOTTOM: 'bottom' },
    '@shell/utils/string': { randomStr: () => 'test-id' },
    ...mocks,
  };

  function load(filename) {
    if (Object.hasOwn(externals, filename)) return externals[filename];
    const absolute = path.resolve(packageRoot, filename);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    if (absolute.endsWith('.json')) return JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (absolute.endsWith('.vue')) return defaultExport({ componentPath: filename });

    const source = fs.readFileSync(absolute, 'utf8');
    const compiled = ts.transpileModule(source, {
      fileName: absolute,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
      reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0, filename);

    const module = { exports: {} };
    cache.set(absolute, module);
    const localRequire = (specifier) => {
      if (Object.hasOwn(externals, specifier)) return externals[specifier];
      if (!specifier.startsWith('.')) {
        // Third-party parsing is real; unexpected Dashboard dependencies must be explicit.
        if (specifier === 'markdown-it') return require(specifier);
        throw new Error(`Unmocked dependency ${specifier} imported by ${filename}`);
      }
      const base = path.resolve(path.dirname(absolute), specifier);
      const resolved = [base, `${base}.ts`, `${base}.js`, `${base}.json`, path.join(base, 'index.ts')]
        .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      assert.ok(resolved, `Missing module ${specifier} imported by ${filename}`);
      return load(path.relative(packageRoot, resolved));
    };
    vm.runInNewContext(compiled.outputText, {
      module,
      exports: module.exports,
      require: localRequire,
      console,
      URL,
      URLSearchParams,
      AbortController,
      DOMException,
      ...globals,
    }, { filename: absolute });
    return module.exports;
  }

  return load;
}

const vueBoundary = {
  computed: (getter) => ({ get value() { return getter(); } }),
  ref: (value) => ({ value }),
  onMounted: () => {},
  onBeforeUnmount: () => {},
  defineAsyncComponent: (loader) => loader,
};

test('chat initializes without Prime access and registers isolated stores and chat-only navigation', () => {
  const stores = [];
  const routes = [];
  const products = [];
  const virtualTypes = [];
  const basicTypes = [];
  const actions = [];
  const registered = [];
  const chatCalls = [];
  const store = {
    getters: new Proxy({}, { get: (_, name) => { throw new Error(`Unexpected startup gate: ${String(name)}`); } }),
  };
  const load = extensionLoader({
    mocks: {
      vue: vueBoundary,
      '@rancher/auto-import': { importTypes: () => {} },
      '@shell/core/types': { ActionLocation: { HEADER: 'header' } },
      'handlers/chat.ts': defaultExport({
        isOpen: () => false,
        open: (target) => chatCalls.push(target),
        close: () => assert.fail('A closed chat should open'),
      }),
      'handlers/hooks/index.ts': defaultExport({ inject: () => {} }),
      'handlers/hooks/overlay/badge-sliding.ts': defaultExport({}),
      'handlers/hooks/overlay/banner-button.ts': defaultExport({}),
    },
  });
  const extension = {
    addProduct: (value) => value.init(extension, store),
    addRoutes: (value) => routes.push(...value),
    register: (...args) => registered.push(args),
    addAction: (...args) => actions.push(args),
    addDashboardStore: (namespace) => stores.push(namespace),
    DSL: (_, name) => {
      assert.equal(name, 'rancher-ai-chat');
      return {
        product: (value) => products.push(value),
        virtualType: (value) => virtualTypes.push(value),
        basicType: (value) => basicTypes.push(...value),
      };
    },
  };

  load('index.ts').default(extension, { store });

  assert.equal(extension.metadata.name, 'rancher-ai-chat');
  assert.deepEqual(stores.sort(), ['chat', 'connection', 'context', 'input', 'staging'].map((name) => `rancher-ai-chat/${name}`).sort());
  assert.equal(new Set(stores).size, stores.length);
  assert.deepEqual(basicTypes, ['chat']);
  assert.deepEqual(virtualTypes.map((item) => item.name), ['chat']);
  assert.ok(routes.some((route) => route.name === products[0].to.name), 'The dropdown must resolve to a registered route');
  assert.ok(routes.every((route) => !/settings|configurations|configure/.test(`${route.path} ${route.name}`)));
  assert.ok(routes.every((route) => route.meta.pkg === 'rancher-ai-chat'));
  assert.ok(registered.some((item) => item[0] === 'component' && item[1] === 'RancherAIChatComponent'));
  assert.equal(actions.length, 1);
  assert.equal(actions[0][0], 'header');
  actions[0][2].invoke();
  assert.deepEqual(chatCalls, [store]);
});

test('renaming the UI extension preserves the deployed agent schema and service identifiers', () => {
  const product = extensionLoader()('product.ts');
  assert.equal(product.RANCHER_AI_SCHEMA.AI_AGENT_CONFIG, 'ai.cattle.io.aiagentconfig');
  assert.equal(product.AGENT_NAMESPACE, 'cattle-ai-agent-system');
  assert.equal(product.AGENT_NAME, 'rancher-ai-agent');
  assert.equal(product.TOOLS_CONFIG_NAME, 'rancher-ai-chat');
  assert.equal(product.AI_CHAT_LABELS.UI_TOOLS, 'rancher-ai-chat-tools');
});

test('new and resumed chats connect through Rancher service proxy using the extension connection store', async () => {
  const requests = [];
  const callbacks = { onopen() {}, async onmessage() {}, onclose() {} };
  const store = { getters: {}, dispatch: async (...args) => requests.push(args) };
  const load = extensionLoader({
    mocks: { vue: vueBoundary, vuex: { useStore: () => store } },
    globals: { window: { location: { host: 'rancher.example.test:8443', protocol: 'https:' } } },
  });
  const connection = load('composables/useConnectionComposable.ts').useConnectionComposable(callbacks);
  await connection.connect();
  await connection.connect('existing-chat-id');
  const proxy = 'wss://rancher.example.test:8443/api/v1/namespaces/cattle-ai-agent-system/services/http:rancher-ai-agent:80/proxy/v1/ws/messages';
  assert.deepEqual(requests.map(([action, options]) => [action, options.url]), [
    ['rancher-ai-chat/connection/open', proxy],
    ['rancher-ai-chat/connection/open', `${proxy}/existing-chat-id`],
  ]);
  for (const [, options] of requests) {
    assert.equal(options.onopen, callbacks.onopen);
    assert.equal(options.onmessage, callbacks.onmessage);
    assert.equal(options.onclose, callbacks.onclose);
  }
});

test('chat history uses the existing agent REST API behind the authenticated Rancher proxy', async () => {
  const requests = [];
  const load = extensionLoader({
    globals: { fetch: async (...args) => {
      requests.push(args);
      return { ok: true, json: async () => [{ id: 'chat-1', name: 'Earlier chat' }] };
    } },
  });
  const api = load('composables/useAIAgentApiComposable.ts').useAIAgentApiComposable();
  const chats = await api.fetchChats();
  assert.equal(chats[0].name, 'Earlier chat');
  assert.equal(requests[0][0], '/api/v1/namespaces/cattle-ai-agent-system/services/http:rancher-ai-agent:80/proxy/v1/api/chats');
});

test('outgoing chat messages retain backend context, tools, labels and optional fields', () => {
  const { formatWSInputMessage } = extensionLoader()('utils/format.ts');
  assert.deepEqual(JSON.parse(formatWSInputMessage({ prompt: 'Hello', tags: [] })), { prompt: 'Hello', context: {} });
  const tools = { name: 'rancher-ai-chat', tools: ['show-yaml', 'show-yaml-diff'] };
  const payload = JSON.parse(formatWSInputMessage({
    prompt: 'Explain this deployment',
    agent: 'cluster-agent',
    context: [{ tag: 'cluster', value: 'c-m-test' }, { tag: 'namespace', value: 'apps' }],
    labels: { summary: 'Investigate deployment' },
    tools,
  }));
  assert.deepEqual(payload, {
    prompt: 'Explain this deployment',
    agent: 'cluster-agent',
    context: { cluster: 'c-m-test', namespace: 'apps' },
    labels: { summary: 'Investigate deployment' },
    tools,
  });
});

test('tool confirmation preserves the requested agent and sends backend yes/no confirmation messages', () => {
  const sent = [];
  const commits = [];
  const store = {
    getters: { 'rancher/byId': () => ({}), 'auth/principalId': 'user-1' },
    commit: (...args) => commits.push(args),
  };
  const load = extensionLoader({
    mocks: {
      vue: vueBoundary,
      vuex: { useStore: () => store },
      '@shell/composables/useI18n': { useI18n: () => ({ t: (key) => key }) },
      '@shell/config/types': { NORMAN: { PRINCIPAL: 'principal' } },
      '@shell/utils/download': { downloadFile() {} },
      'composables/useContextComposable.ts': { useContextComposable: () => ({ selectedContext: { value: [] } }) },
      'composables/useToolsComposable.ts': { useToolsComposable: () => ({ toolsSelector: { value: {} } }) },
      'composables/useAIAgentApiComposable.ts': { useAIAgentApiComposable: () => ({}) },
      'handlers/authentication.ts': defaultExport({ abortPendingRequests() {} }),
    },
    globals: { WebSocket: { OPEN: 1 } },
  });
  const chat = load('composables/useChatMessageComposable.ts').useChatMessageComposable(
    'chat-1', { value: true }, { value: [] }, { value: 'different-current-agent' }, () => {}
  );
  const ws = { readyState: 1, send: (value) => sent.push(JSON.parse(value)) };
  const actions = [{ type: 'patch', name: 'deployment-1' }];
  const message = { id: 'message-1', agentMetadata: { agent: { name: 'requesting-agent' } }, confirmation: { actions, status: 'pending' } };

  chat.confirmMessage({ message, result: true }, ws);
  chat.confirmMessage({ message, result: false }, ws);

  assert.deepEqual(sent, [
    { prompt: 'yes', agent: 'requesting-agent', context: {}, tags: ['confirmation'] },
    { prompt: 'no', agent: 'requesting-agent', context: {}, tags: ['confirmation'] },
  ]);
  assert.deepEqual(plain(commits), [
    ['rancher-ai-chat/chat/updateMessage', { chatId: 'chat-1', message: { id: 'message-1', confirmation: { actions, status: 'confirmed' } } }],
    ['rancher-ai-chat/chat/updateMessage', { chatId: 'chat-1', message: { id: 'message-1', confirmation: { actions, status: 'canceled' } } }],
  ]);
  chat.confirmMessage({ message, result: true }, { readyState: 3, send: () => assert.fail('Closed socket must not send') });
});


test('generated UI tools manifest belongs to this extension and matches its backend selector', () => {
  const { execFileSync } = require('node:child_process');
  const yaml = require('js-yaml');
  const manifest = yaml.load(execFileSync(process.execPath, [path.join(packageRoot, 'scripts/tools-configmap.cjs')], { encoding: 'utf8' }));
  const product = extensionLoader()('product.ts');
  assert.equal(manifest.metadata.name, product.TOOLS_CONFIG_NAME);
  assert.equal(manifest.metadata.name, 'rancher-ai-chat');
  assert.equal(manifest.metadata.namespace, product.AGENT_NAMESPACE);
  assert.equal(manifest.metadata.labels.app, product.AI_CHAT_LABELS.UI_TOOLS);
  assert.deepEqual(JSON.parse(manifest.data.config).tools, require('../ui-tools.json').tools);
});

test('UI tools read only this extension ConfigMap and never fall back to the original UI configuration', async () => {
  for (const present of [true, false]) {
    const requests = [];
    const mounted = [];
    const ownId = 'cattle-ai-agent-system/rancher-ai-chat';
    const oldId = 'cattle-ai-agent-system/rancher-ai-ui';
    const data = { data: { config: JSON.stringify({ config: { enabled: true }, tools: [{ name: 'show-yaml', enabled: true }] }) } };
    const byId = { [oldId]: data, ...(present ? { [ownId]: data } : {}) };
    const store = {
      getters: { 'management/byId': (_, id) => byId[id] },
      dispatch: async (action, params) => {
        requests.push([action, plain(params)]);
        if (!byId[params.id]) throw new Error('Not found');
        return byId[params.id];
      },
    };
    const load = extensionLoader({ mocks: {
      vue: { ...vueBoundary, onMounted: (callback) => mounted.push(callback) },
      vuex: { useStore: () => store },
      semver: require('semver'),
      '@shell/config/types': { CONFIG_MAP: 'configmap' },
      'utils/version.ts': { getRancherVersion: () => '2.13.0' },
      'utils/log.ts': { warn() {} },
    } });
    const tools = load('composables/useToolsComposable.ts').useToolsComposable();
    await Promise.all(mounted.map((callback) => callback()));
    assert.deepEqual(requests, [['management/find', { type: 'configmap', id: ownId }]]);
    if (present) {
      assert.deepEqual(plain(tools.toolsSelector.value), { name: 'rancher-ai-chat', tools: ['show-yaml'] });
    } else {
      assert.equal(tools.toolsSelector.value, undefined);
      assert.equal(tools.toolsStatus.value, 'unavailable');
    }
  }
});
