// Adapted from rancher-ai-ui for this chat-only extension; see README.md and LICENSE.
import { IPlugin } from '@shell/core/types';
import { RIGHT } from '@shell/utils/position';

export const PRODUCT_NAME = 'rancher-ai-chat';
export const BLANK_CLUSTER = '_';

export const AGENT_NAMESPACE = 'cattle-ai-agent-system';
export const AGENT_NAME = 'rancher-ai-agent';
export const AGENT_WS_API_PATH = 'v1/ws/messages';
export const AGENT_REST_API_PATH = 'v1/api';

export const RANCHER_AI_SCHEMA = { AI_AGENT_CONFIG: 'ai.cattle.io.aiagentconfig' };

export const AI_CHAT_LABELS = { UI_TOOLS: 'rancher-ai-chat-tools' };

export const AGENT_CONFIG_CONFIG_MAP_NAME = 'llm-config';
export const TOOLS_CONFIG_NAME = 'rancher-ai-chat';

export const PANEL_POSITION = RIGHT;

export const PERMISSIONS_DOCS_URL = 'https://rancher.github.io/rancher-ai-product-docs/rancher-ai/latest/en/how-tos/how-to-admin.html#rbac';

// The product opens the same docked chat used by resource tools and the header action.
export function init(extension: IPlugin, store: any) {
  const { product, virtualType, basicType } = extension.DSL(store, PRODUCT_NAME);
  const route = { name: `${ PRODUCT_NAME }-c-cluster-chat` };

  product({
    icon: 'ai',
    inStore: 'cluster',
    weight: 95,
    to: route,
  });

  virtualType({
    name: 'chat',
    labelKey: 'aiChat.header.title',
    namespaced: false,
    route,
  });
  basicType(['chat']);
}
