/**
 * @ascended-agents/sdk-adapter
 *
 * Integration layer between Ascended-Agents and the Ascended-SDK.
 *
 * Responsibilities:
 *   - Type alignment: expose shared types in the shape Ascended-SDK expects.
 *   - Request/response normalisation: convert between agent I/O formats.
 *   - Embedding compatibility hooks: describe what context is needed (no execution).
 *
 * This package does NOT:
 *   - Execute API calls.
 *   - Store memory or embeddings.
 *   - Duplicate types already defined in @ascended-agents/core.
 */

import { z } from 'zod';
import type {
  AgentDefinition,
  AgentInput,
  AgentOutput,
  ExecutionStep,
  ToolDefinition,
  Environment,
} from '@ascended-agents/core';
import { listAgents, getAgent } from '@ascended-agents/registry';

// ─── SDK-aligned Request / Response types ─────────────────────────────────────

/**
 * Normalised request shape expected by the Ascended-SDK gateway.
 * Maps directly to AgentInput with SDK-specific metadata.
 */
export interface SdkAgentRequest {
  agentId: string;
  version?: string;
  input: Record<string, unknown>;
  context?: Record<string, unknown>;
  environment?: Environment;
  sessionId?: string;
  /** Embedding hint — the SDK uses this to pre-fetch relevant memory */
  embeddingScope?: string;
  /** Tenant identifier for multi-tenant deployments */
  tenantId?: string;
  /** Correlation ID for distributed tracing */
  correlationId?: string;
}

/**
 * Normalised response shape returned by the Ascended-SDK gateway.
 */
export interface SdkAgentResponse {
  agentId: string;
  version: string;
  sessionId: string;
  correlationId?: string;
  executionPlan: ExecutionStep[];
  meta: Record<string, unknown>;
  validation: {
    schemaValid: boolean;
    constraintsPassed: boolean;
    toolsResolved: boolean;
  };
}

// ─── SDK Discovery types ───────────────────────────────────────────────────────

export interface SdkAgentSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  tools: Array<{ name: string; description: string; version: string }>;
  capabilities: string[];
}

// ─── Normalisation helpers ─────────────────────────────────────────────────────

/**
 * Convert an SdkAgentRequest to the internal AgentInput format.
 */
export function sdkRequestToAgentInput(req: SdkAgentRequest): AgentInput {
  return {
    input: req.input,
    context: {
      ...req.context,
      tenantId: req.tenantId,
      correlationId: req.correlationId,
    },
    environment: req.environment ?? 'production',
    sessionId: req.sessionId ?? crypto.randomUUID(),
  };
}

/**
 * Convert an internal AgentOutput to the SdkAgentResponse format.
 */
export function agentOutputToSdkResponse(
  agentId: string,
  version: string,
  sessionId: string,
  output: AgentOutput,
  correlationId?: string,
): SdkAgentResponse {
  return {
    agentId,
    version,
    sessionId,
    correlationId,
    executionPlan: output.executionPlan,
    meta: output.meta,
    validation: output.validation,
  };
}

// ─── Discovery API ─────────────────────────────────────────────────────────────

/**
 * Return a compact summary of all registered agents, suitable for the SDK discovery endpoint.
 */
export function listAgentSummaries(environment?: Environment): SdkAgentSummary[] {
  return listAgents(environment).map((def) => toSummary(def));
}

/**
 * Return a compact summary for a specific agent.
 */
export function getAgentSummary(id: string, version?: string): SdkAgentSummary {
  return toSummary(getAgent(id, version));
}

function toSummary(def: AgentDefinition): SdkAgentSummary {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    version: def.version,
    tools: def.tools.map((t) => ({
      name: t.name,
      description: t.description,
      version: t.version,
    })),
    capabilities: deriveCapabilities(def),
  };
}

function deriveCapabilities(def: AgentDefinition): string[] {
  const caps: string[] = [];
  if (def.memory?.required) caps.push('memory');
  if (def.subAgentIds?.length) caps.push('delegation');
  if (def.failure?.fallbackAgent) caps.push('fallback');
  if (def.plugins?.length) caps.push('plugins');
  caps.push(...(def.constraints.allowedTools ?? []));
  return [...new Set(caps)];
}

// ─── Embedding Compatibility Hook ─────────────────────────────────────────────

/**
 * Describe the embedding context required by an agent.
 * The Ascended-SDK uses this hint to pre-fetch relevant VectorDB entries
 * before invoking the agent.
 *
 * This function NEVER accesses the VectorDB directly.
 */
export function getEmbeddingHint(
  agentId: string,
  input: Record<string, unknown>,
): { scope: string; query: string; queryType: 'semantic' | 'exact' | 'hybrid' } | null {
  const def = getAgent(agentId);
  if (!def.memory) return null;
  return {
    scope: def.memory.scope,
    queryType: def.memory.queryType,
    query: JSON.stringify(input),
  };
}

// ─── Zod validation schema for SDK requests ───────────────────────────────────

export const sdkAgentRequestSchema = z.object({
  agentId: z.string().min(1),
  version: z.string().optional(),
  input: z.record(z.unknown()),
  context: z.record(z.unknown()).optional(),
  environment: z.enum(['dev', 'staging', 'production']).optional(),
  sessionId: z.string().optional(),
  embeddingScope: z.string().optional(),
  tenantId: z.string().optional(),
  correlationId: z.string().optional(),
});

export type { AgentDefinition, AgentInput, AgentOutput, ToolDefinition, Environment };
