# AI Chat

A chat and tools extension based on official `rancher-ai-ui` 1.1.0. Select **AI Chat** in the Rancher product dropdown or use the header button to open the docked chat. It stays open while you explore resources.

## Features

- Streaming conversations, chat history, downloads, agent selection, and MCP authentication.
- Cluster/resource context and the existing status-badge and error-banner chat shortcuts.
- Tool results, explicit action confirmations, YAML viewers and diffs, resource navigation, pod logs, suggestions, and choices.
- No provider, agent, or UI-tools configuration page or settings actions. Configuration remains administrator-managed.

## Requirements

Rancher 2.13 or later, UI Extensions API 3, and an existing configured `rancher-ai-agent` compatible with the 1.1.0 API. The extension uses Rancher's authenticated service proxy for `cattle-ai-agent-system/rancher-ai-agent:80`; it does not install an agent or provision credentials.

The logged-in user needs the normal agent access permissions, including read access to its deployment, `llm-config` ConfigMap, and enabled `ai.cattle.io.aiagentconfig` resources. Backend permissions and tool confirmations remain in effect.

## Independent tool definitions

This extension uses its own `cattle-ai-agent-system/rancher-ai-chat` ConfigMap, generated from its bundled `ui-tools.json`. It does not read, require, create, or update the original UI extension's ConfigMap, and the original UI extension does not need to be installed. The manifest's `app: rancher-ai-chat-tools` label identifies this extension; the agent reads the ConfigMap by the exact name in each request, without a label selector.

Generate the manifest from this repository, review it, and install it in the management cluster where the agent runs:

```sh
node pkg/rancher-ai-chat/scripts/tools-configmap.cjs > /tmp/ai-chat-tools.yaml
# Review /tmp/ai-chat-tools.yaml, then use the management cluster context:
kubectl --context <management-context> apply -f /tmp/ai-chat-tools.yaml
```

The extension and the agent need read access to this ConfigMap. If RBAC is restricted by `resourceNames`, allow `rancher-ai-chat` there. Existing custom tool enablement or prompts are not copied from the old ConfigMap: review the generated defaults and customize `data.config` if needed. The old ConfigMap is left untouched. Close and reopen chat after installing or updating the definitions so its local selection is refreshed.

The ConfigMap holds tool descriptions, input schemas, selection prompts, enabled flags, version constraints, and maximum tool count. It contains no model credentials. Administrators manage it through manifests or GitOps; there is no configuration page. Without it, normal agent chat and backend tools remain available, but optional UI tool selection is unavailable.

## How tools work

There are two kinds of tools:

- **Agent/MCP tools** perform the actual operations: query Kubernetes or other connected systems, fetch data, and make configured changes. The agent discovers these through its enabled `ai.cattle.io.aiagentconfig` resources and MCP servers. Available operations, credentials, permissions, and which tools require human confirmation are backend configuration.
- **UI tools** present the results and offer interactions: YAML and diff viewers, resource navigation, pod-log panels, suggested prompts, and choices. Their Vue components are bundled in this extension. Adding a definition alone does not add a new component or an MCP capability.

For each prompt, the extension sends context, the selected agent, and a selector such as `{"name":"rancher-ai-chat","tools":["show-yaml","show-yaml-diff"]}` through the authenticated Rancher WebSocket proxy. The selector includes only enabled, locally supported tools compatible with the running Rancher version.

The backend performs its agent/MCP work. Its UI-tool selector reads this extension's ConfigMap, filters its definitions by the requested names, and uses the model to choose suitable UI components and arguments. It validates the selected arguments and returns tool events to the chat, which renders the bundled components. UI selection can add a model call beyond the normal agent response. Welcome suggestions use the same named ConfigMap through the `/complete/ui-tools` REST endpoint.

For operations configured for human validation, the backend pauses and supplies a confirmation preview. The chat sends a tagged `yes` or `no` response to resume or cancel that operation. Enabling a UI viewer does not grant backend permissions or make all MCP operations require confirmation. UI buttons such as resource navigation and pod logs use the current Rancher session; the staging editor's Apply action returns a confirmation to the agent rather than independently applying Kubernetes YAML.

This is an independent **frontend extension and UI-tool configuration**, while retaining the configured `rancher-ai-agent` backend, its `llm-config`, and its agent CRDs. A completely separate backend/LLM/MCP stack would be a separate deployment and is not bundled here.

## Build and test

Run from the repository root after installing its dependencies:

```sh
node --test pkg/rancher-ai-chat/tests/*.test.cjs
yarn build-pkg rancher-ai-chat
```

The extension bundle is written to `dist-pkg/rancher-ai-chat-0.1.0/`. Use `yarn serve-pkgs` for the normal local extension-loading workflow. The existing release workflow recognizes the tag `rancher-ai-chat-0.1.0`; deployment and publishing are separate from creating the source package.

The fork has separate product, route, component, store, and translation identifiers. It retains the agent service and CRD identifiers for backend compatibility and uses its own tools ConfigMap. Use one chat extension at a time to avoid duplicate header shortcuts and resource overlays.

## Origin

Adapted from `rancher/rancher-ai-ui`, source revision `efd2f2fb9ed30d81c009db9cfbdb7e3dd6bc1c32`, under Apache-2.0 (see `LICENSE`). Modified for chat-only navigation, administrator-managed tool definitions, independent UI identifiers and the shell version in this repository.
