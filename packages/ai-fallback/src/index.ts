import type { AgentInput, AgentOutput, ExecutionStep } from '@ascended-agents/core';

// ─── Fallback Model Config ─────────────────────────────────────────────────────

export type FallbackModel = 'openai' | 'ollama' | 'stub';

export interface FallbackConfig {
  model: FallbackModel;
  /** API endpoint — required for 'openai' and 'ollama' models */
  endpoint?: string;
  /** Auth token — required for 'openai' model; injected by host (DEL/SDK) */
  apiKey?: string;
  /** Model name (e.g. 'gpt-4o', 'llama3') */
  modelName?: string;
  /** Max tokens for the fallback response */
  maxTokens?: number;
}

// ─── Fallback Result ──────────────────────────────────────────────────────────

export interface FallbackResult {
  model: FallbackModel;
  agentId: string;
  condition: string;
  suggestedPlan: ExecutionStep[];
  rawResponse?: string;
  warning: string;
}

// ─── Abstract Adapter ─────────────────────────────────────────────────────────

/**
 * Every fallback adapter implements this contract.
 * Adapters are pure suggestion engines — they NEVER execute plans.
 */
export interface FallbackAdapter {
  suggest(
    agentId: string,
    condition: string,
    input: AgentInput,
    config: FallbackConfig,
  ): Promise<FallbackResult>;
}

// ─── OpenAI Adapter (stub — actual HTTP call is injected by host) ─────────────

export class OpenAIFallbackAdapter implements FallbackAdapter {
  async suggest(
    agentId: string,
    condition: string,
    input: AgentInput,
    config: FallbackConfig,
  ): Promise<FallbackResult> {
    // Ascended-Agents does NOT execute API calls.
    // The host (DEL or SDK) is expected to replace this stub with a real
    // HTTP call via the Ascended-SDK client. This stub returns a safe no-op plan
    // so the system degrades gracefully without failing hard.
    console.warn(
      `[ai-fallback] OpenAI fallback invoked for agent "${agentId}" (condition: ${condition}). ` +
        `This is a stub — wire up a real HTTP call via @ascendstack/ascended-sdk in the host.`,
    );
    return buildNoOpFallbackResult(agentId, condition, 'openai', config);
  }
}

// ─── Ollama Adapter (stub) ────────────────────────────────────────────────────

export class OllamaFallbackAdapter implements FallbackAdapter {
  async suggest(
    agentId: string,
    condition: string,
    _input: AgentInput,
    config: FallbackConfig,
  ): Promise<FallbackResult> {
    console.warn(
      `[ai-fallback] Ollama fallback invoked for agent "${agentId}" (condition: ${condition}). ` +
        `This is a stub — wire a real Ollama HTTP call via the host.`,
    );
    return buildNoOpFallbackResult(agentId, condition, 'ollama', config);
  }
}

// ─── Stub Adapter (for testing / dev) ────────────────────────────────────────

export class StubFallbackAdapter implements FallbackAdapter {
  async suggest(
    agentId: string,
    condition: string,
    _input: AgentInput,
    config: FallbackConfig,
  ): Promise<FallbackResult> {
    return buildNoOpFallbackResult(agentId, condition, 'stub', config);
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createFallbackAdapter(config: FallbackConfig): FallbackAdapter {
  switch (config.model) {
    case 'openai':
      return new OpenAIFallbackAdapter();
    case 'ollama':
      return new OllamaFallbackAdapter();
    case 'stub':
    default:
      return new StubFallbackAdapter();
  }
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

/**
 * Call the AI fallback for an agent that has failed its deterministic pipeline.
 *
 * This function:
 *   1. Selects the correct adapter based on `config.model`.
 *   2. Asks the adapter to suggest an execution plan.
 *   3. Returns the suggestion WITHOUT executing it.
 *
 * Execution is always delegated to DEL.
 */
export async function callAIFallback(
  agentId: string,
  condition: string,
  input: AgentInput,
  config: FallbackConfig,
): Promise<FallbackResult> {
  const adapter = createFallbackAdapter(config);
  return adapter.suggest(agentId, condition, input, config);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildNoOpFallbackResult(
  agentId: string,
  condition: string,
  model: FallbackModel,
  _config: FallbackConfig,
): FallbackResult {
  const noOpStep: ExecutionStep = {
    step: 'event_emit',
    event: 'agent.fallback.noop',
    payload: { agentId, condition, model },
  };
  return {
    model,
    agentId,
    condition,
    suggestedPlan: [noOpStep],
    warning:
      `AI fallback (${model}) returned a no-op plan for agent "${agentId}". ` +
      `Replace this stub with a real LLM integration in the host layer.`,
  };
}

export type { AgentInput, AgentOutput };
