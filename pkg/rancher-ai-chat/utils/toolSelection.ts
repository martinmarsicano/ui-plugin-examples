import semver from 'semver';
import type { ToolsConfig } from '../types';

type ToolDefinition = {
  name: string;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
};

export type ToolsAvailability = 'available' | 'unavailable' | 'disabled' | 'noCompatibleTools';

export interface ToolsSelection {
  status: ToolsAvailability;
  selector?: ToolsConfig;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function supportsRancher(tool: ToolDefinition, rancherVersion: string): boolean {
  const range = tool.metadata?.['rancher-version'];

  if (range === undefined || range === '') {
    return true;
  }

  return typeof range === 'string' && semver.satisfies(rancherVersion, range);
}

/** Select only enabled, locally supported tools from the administrator's definition. */
export function selectAvailableTools(
  serializedConfig: unknown,
  supportedTools: readonly ToolDefinition[],
  rancherVersion: string,
  configName: string
): ToolsSelection {
  if (typeof serializedConfig !== 'string' || !serializedConfig) {
    return { status: 'unavailable' };
  }

  let definition: unknown;

  try {
    definition = JSON.parse(serializedConfig);
  } catch {
    return { status: 'unavailable' };
  }

  if (!isRecord(definition) || !Array.isArray(definition.tools)) {
    return { status: 'unavailable' };
  }

  // Missing enabled flags default to true in the agent's ConfigMap loader.
  if (isRecord(definition.config) && definition.config.enabled === false) {
    return { status: 'disabled' };
  }

  const supportedByName = new Map(supportedTools.map((tool) => [tool.name, tool]));
  const names = new Set<string>();

  for (const configuredTool of definition.tools) {
    if (!isRecord(configuredTool) || typeof configuredTool.name !== 'string' || configuredTool.enabled === false) {
      continue;
    }

    const supportedTool = supportedByName.get(configuredTool.name);

    if (!supportedTool) {
      continue;
    }

    const tool: ToolDefinition = {
      name:     configuredTool.name,
      metadata: isRecord(configuredTool.metadata) ? configuredTool.metadata : undefined
    };

    if (supportsRancher(tool, rancherVersion) && supportsRancher(supportedTool, rancherVersion)) {
      names.add(tool.name);
    }
  }

  if (!names.size) {
    return { status: 'noCompatibleTools' };
  }

  return {
    status:   'available',
    selector: { name: configName, tools: [...names] }
  };
}
