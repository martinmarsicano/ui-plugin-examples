// Print a reviewable manifest; this script does not access or change a cluster.
const { config, tools, metadata } = require('../ui-tools.json');
const yaml = require('js-yaml');

process.stdout.write(yaml.dump({
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'rancher-ai-chat',
    namespace: 'cattle-ai-agent-system',
    labels: { app: 'rancher-ai-chat-tools' },
    annotations: metadata?.annotations || {},
  },
  data: { config: JSON.stringify({ config, tools }) },
}, { lineWidth: -1 }));
