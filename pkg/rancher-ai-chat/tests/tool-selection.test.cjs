const assert = require('node:assert/strict');
const { test } = require('node:test');

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' }
});

const { selectAvailableTools } = require('../utils/toolSelection.ts');
const bundledTools = require('../ui-tools.json').tools;
const configName = 'rancher-ai-chat';

function select(definition, tools = bundledTools, version = '2.13.0') {
  return selectAvailableTools(JSON.stringify(definition), tools, version, configName);
}

test('keeps admin-enabled supported tools despite unrelated spec and revision drift', () => {
  const definition = {
    config: { enabled: true, revision: 99, systemPrompt: 'Administrator prompt' },
    tools: [
      { name: 'show-yaml', enabled: true, revision: 99, prompt: 'Customized prompt' },
      { name: 'show-yaml-diff', enabled: false },
      { name: 'unsupported-renderer', enabled: true }
    ]
  };
  const original = JSON.stringify(definition);

  assert.deepEqual(select(definition), {
    status: 'available',
    selector: { name: configName, tools: ['show-yaml'] }
  });
  assert.equal(JSON.stringify(definition), original);
});

test('honors administrator disablement and absent enabled defaults from the backend loader', () => {
  assert.deepEqual(select({ config: { enabled: false }, tools: [{ name: 'show-yaml' }] }), { status: 'disabled' });
  assert.deepEqual(select({ tools: [{ name: 'show-yaml' }] }), {
    status: 'available',
    selector: { name: configName, tools: ['show-yaml'] }
  });
  assert.deepEqual(select({ tools: [{ name: 'show-yaml', enabled: false }] }), { status: 'noCompatibleTools' });
});

test('applies bundled Rancher version requirements even when admin metadata omits them', () => {
  assert.deepEqual(select({ tools: [{ name: 'show-yaml' }] }, bundledTools, '2.12.3'), { status: 'noCompatibleTools' });
});

test('also applies administrator Rancher constraints without disabling unrelated compatible tools', () => {
  const supported = [{ name: 'old-tool' }, { name: 'new-tool' }];
  const definition = {
    tools: [
      { name: 'old-tool', metadata: { 'rancher-version': '>=2.12.0' } },
      { name: 'new-tool', metadata: { 'rancher-version': '>=2.14.0' } }
    ]
  };

  assert.deepEqual(select(definition, supported), {
    status: 'available',
    selector: { name: configName, tools: ['old-tool'] }
  });
});

test('missing and malformed definitions leave UI tools optional', () => {
  for (const serialized of [undefined, null, '', '{broken', 'null', '[]', '{}', '{"tools": {}}']) {
    assert.deepEqual(selectAvailableTools(serialized, bundledTools, '2.13.0', configName), { status: 'unavailable' });
  }
  assert.deepEqual(select({ tools: [] }), { status: 'noCompatibleTools' });
});

test('ignores malformed entries, invalid version ranges, and duplicate tool names', () => {
  const supported = [{ name: 'valid' }, { name: 'invalid-range' }];
  const definition = {
    tools: [
      null,
      42,
      { name: 123 },
      { name: 'invalid-range', metadata: { 'rancher-version': 42 } },
      { name: 'invalid-range', metadata: { 'rancher-version': 'broken' } },
      { name: 'valid', metadata: null },
      { name: 'valid' }
    ]
  };

  assert.deepEqual(select(definition, supported), {
    status: 'available',
    selector: { name: configName, tools: ['valid'] }
  });
});
