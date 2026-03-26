import type {
  AgentDefinition,
  CompiledAgent,
  Environment,
  RegistryEntry,
} from '@ascended-agents/core';
import { validateAgentDefinition } from '@ascended-agents/core';

// ─── Registry Store ────────────────────────────────────────────────────────────

/** In-memory registry — keyed by `agentId:version` */
const store = new Map<string, RegistryEntry>();

/** Plugin registry — dynamically loaded agents */
const pluginStore = new Map<string, AgentDefinition>();

function registryKey(id: string, version: string): string {
  return `${id}:${version}`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Register an agent definition in the registry.
 * Validates the definition before storing it.
 */
export function registerAgent(
  definition: AgentDefinition,
  environment?: Environment,
): void {
  validateAgentDefinition(definition);
  const key = registryKey(definition.id, definition.version);
  store.set(key, {
    definition,
    registeredAt: new Date().toISOString(),
    environment,
  });
}

/**
 * Retrieve a specific agent by id and version.
 * If no version is supplied, returns the latest registered version.
 */
export function getAgent(id: string, version?: string): AgentDefinition {
  if (version) {
    const entry = store.get(registryKey(id, version));
    if (!entry) {
      throw new Error(`Agent not found: ${id}@${version}`);
    }
    return entry.definition;
  }

  // Find the latest version (lexicographic semver sort is sufficient for our purposes)
  const matching = [...store.values()]
    .filter((e) => e.definition.id === id)
    .sort((a, b) =>
      b.definition.version.localeCompare(a.definition.version, undefined, { numeric: true }),
    );

  if (matching.length === 0) {
    throw new Error(`Agent not found: ${id}`);
  }
  return matching[0].definition;
}

/**
 * List all registered agents.
 * Optionally filter by environment.
 */
export function listAgents(environment?: Environment): AgentDefinition[] {
  return [...store.values()]
    .filter((e) => !environment || !e.environment || e.environment === environment)
    .map((e) => e.definition);
}

/**
 * Deregister an agent from the registry.
 */
export function deregisterAgent(id: string, version: string): boolean {
  return store.delete(registryKey(id, version));
}

/**
 * Attach a compiled artifact to a registered agent.
 */
export function attachCompiledAgent(
  id: string,
  version: string,
  compiled: CompiledAgent,
): void {
  const key = registryKey(id, version);
  const entry = store.get(key);
  if (!entry) {
    throw new Error(`Cannot attach compiled artifact — agent not found: ${id}@${version}`);
  }
  store.set(key, { ...entry, compiled });
}

/**
 * Retrieve the compiled artifact for an agent.
 */
export function getCompiledAgent(id: string, version: string): CompiledAgent | undefined {
  return store.get(registryKey(id, version))?.compiled;
}

/**
 * Search agents by capability tags or name substring.
 */
export function searchAgents(query: string): AgentDefinition[] {
  const lq = query.toLowerCase();
  return [...store.values()]
    .map((e) => e.definition)
    .filter(
      (d) =>
        d.id.includes(lq) ||
        d.name.toLowerCase().includes(lq) ||
        d.description.toLowerCase().includes(lq) ||
        d.tools.some((t) => t.tags?.some((tag) => tag.toLowerCase().includes(lq))),
    );
}

// ─── Plugin Registry ──────────────────────────────────────────────────────────

/**
 * Register a plugin-sourced agent.
 * Plugin agents are sandboxed — they MUST be pre-validated before registration.
 */
export function registerPlugin(definition: AgentDefinition): void {
  if (!definition.plugins?.length) {
    throw new Error(`Plugin agent "${definition.id}" must declare at least one plugin`);
  }
  const notValidated = definition.plugins.filter((p) => !p.validated);
  if (notValidated.length > 0) {
    throw new Error(
      `Plugin agent "${definition.id}" has unvalidated plugins: ${notValidated.map((p) => p.id).join(', ')}`,
    );
  }
  validateAgentDefinition(definition);
  pluginStore.set(definition.id, definition);
}

/**
 * Retrieve a plugin agent.
 */
export function getPlugin(id: string): AgentDefinition | undefined {
  return pluginStore.get(id);
}

/**
 * List all registered plugin agents.
 */
export function listPlugins(): AgentDefinition[] {
  return [...pluginStore.values()];
}

/**
 * Clear the entire registry (for testing purposes).
 */
export function clearRegistry(): void {
  store.clear();
  pluginStore.clear();
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { AgentDefinition, RegistryEntry, Environment };
