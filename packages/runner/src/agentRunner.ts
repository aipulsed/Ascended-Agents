import type {
  AgentDefinition,
  AgentInput,
  AgentOutput,
  ExecutionStep,
  Environment,
} from '@ascended-agents/core';
import { sanitizeAgentOutput, validateAgentDefinition } from '@ascended-agents/core';
import { fullValidationPipeline } from '@ascended-agents/validator';
import { getAgent } from '@ascended-agents/registry';
import { callAIFallback } from '@ascended-agents/ai-fallback';
import type { FallbackConfig } from '@ascended-agents/ai-fallback';

// ─── Runner Context ────────────────────────────────────────────────────────────

export interface RunnerContext {
  /** The resolved agent definition */
  agent: AgentDefinition;
  /** Merged input (user input + context) */
  input: AgentInput;
  /** Active environment */
  environment: Environment;
  /** Session identifier for observability */
  sessionId: string;
}

// ─── Agent Runner ──────────────────────────────────────────────────────────────

/**
 * AgentRunner
 *
 * Resolves an agent definition, validates it, applies environment-aware
 * constraints, generates a structured execution plan, and returns it.
 *
 * This class does NOT execute the plan — execution is always delegated
 * to the Deterministic Execution Layer (DEL).
 */
export class AgentRunner {
  /**
   * Run an agent by ID.
   *
   * @param agentId     The registered agent ID.
   * @param input       Structured agent input.
   * @param version     Optional version pin. If omitted, latest is used.
   */
  async run(
    agentId: string,
    input: AgentInput,
    version?: string,
  ): Promise<AgentOutput> {
    // 1. Resolve agent from registry
    const agent = getAgent(agentId, version);

    // 2. Validate the agent definition
    validateAgentDefinition(agent);

    // 3. Build runner context
    const environment: Environment = input.environment ?? 'production';
    const sessionId = input.sessionId ?? crypto.randomUUID();
    const ctx: RunnerContext = { agent, input, environment, sessionId };

    // 4. Apply environment-specific constraint overrides
    const effectiveConstraints = resolveConstraints(agent, environment);

    // 5. Validate input against agent's inputSchema
    const inputValidation = agent.inputSchema.safeParse(input.input);
    if (!inputValidation.success) {
      const errors = inputValidation.error.issues.map((i) => `[${i.path.join('.')}] ${i.message}`);
      // Trigger fallback if configured
      if (agent.failure?.fallbackAgent) {
        return this.runFallback(ctx, 'input_schema_validation_failed');
      }
      throw new Error(`Agent "${agentId}" input validation failed:\n${errors.join('\n')}`);
    }

    // 6. Generate execution plan
    const plan = generateExecutionPlan(agent, input, effectiveConstraints);

    // 7. Enforce constraint: max steps
    if (plan.length > effectiveConstraints.maxSteps) {
      throw new Error(
        `Agent "${agentId}" generated ${plan.length} steps but constraint allows max ${effectiveConstraints.maxSteps}.`,
      );
    }

    // 8. Build the raw output
    const rawOutput: AgentOutput = {
      executionPlan: plan,
      meta: {
        agentId,
        agentVersion: agent.version,
        sessionId,
        environment,
        generatedAt: new Date().toISOString(),
      },
      validation: {
        schemaValid: true,
        constraintsPassed: true,
        toolsResolved: true,
      },
    };

    // 9. Sanitize and validate output
    return sanitizeAgentOutput(rawOutput);
  }

  /**
   * Run an agent from a raw (JSON-serialisable) definition rather than the registry.
   * Useful for testing / playground scenarios.
   */
  async runFromDefinition(
    agent: AgentDefinition,
    input: AgentInput,
  ): Promise<AgentOutput> {
    // Full static validation first
    const { passed, agentValidation, staticAnalysis } = fullValidationPipeline(agent);
    if (!passed) {
      const allErrors = [
        ...agentValidation.errors,
        ...staticAnalysis.filter((i) => i.severity === 'error').map((i) => i.message),
      ];
      throw new Error(`Agent definition validation failed:\n${allErrors.join('\n')}`);
    }

    const environment: Environment = input.environment ?? 'production';
    const sessionId = input.sessionId ?? crypto.randomUUID();
    const effectiveConstraints = resolveConstraints(agent, environment);
    const plan = generateExecutionPlan(agent, input, effectiveConstraints);

    const rawOutput: AgentOutput = {
      executionPlan: plan,
      meta: {
        agentId: agent.id,
        agentVersion: agent.version,
        sessionId,
        environment,
        generatedAt: new Date().toISOString(),
      },
      validation: {
        schemaValid: true,
        constraintsPassed: true,
        toolsResolved: true,
      },
    };

    return sanitizeAgentOutput(rawOutput);
  }

  /** Trigger the configured AI fallback for an agent. */
  private async runFallback(ctx: RunnerContext, condition: string): Promise<AgentOutput> {
    const fallbackConfig: FallbackConfig = {
      model: 'stub',
      modelName: ctx.agent.failure?.fallbackAgent ?? 'stub',
    };

    const result = await callAIFallback(ctx.agent.id, condition, ctx.input, fallbackConfig);

    return sanitizeAgentOutput({
      executionPlan: result.suggestedPlan,
      meta: {
        agentId: ctx.agent.id,
        fallback: true,
        fallbackModel: result.model,
        condition,
        warning: result.warning,
        sessionId: ctx.sessionId,
        generatedAt: new Date().toISOString(),
      },
      validation: {
        schemaValid: false,
        constraintsPassed: false,
        toolsResolved: false,
      },
    });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

import type { Constraint } from '@ascended-agents/core';

function resolveConstraints(agent: AgentDefinition, env: Environment): Constraint {
  const base = agent.constraints;
  const override = agent.environmentOverrides?.[env];
  if (!override) return base;
  return { ...base, ...override };
}

/**
 * Generate a deterministic execution plan from an agent definition.
 *
 * The planner iterates over the agent's declared tools and produces
 * a tool_call step for each one (filtered by allowed tools in constraints).
 *
 * Agents that declare memory requirements prepend a memory_request step.
 * Agents that declare sub-agents append delegate steps.
 *
 * NOTE: The input values are passed as-is into each step's `input` field
 * so DEL can resolve them at execution time.
 */
function generateExecutionPlan(
  agent: AgentDefinition,
  input: AgentInput,
  constraints: Constraint,
): ExecutionStep[] {
  const plan: ExecutionStep[] = [];

  // Memory request step (if required)
  if (agent.memory?.required) {
    plan.push({
      step: 'memory_request',
      scope: agent.memory.scope,
      queryType: agent.memory.queryType,
      query: JSON.stringify(input.input),
      limit: agent.memory.limit,
    });
  }

  // Tool call steps (only for allowed tools)
  const allowedTools = new Set(
    input.tools ?? constraints.allowedTools,
  );

  for (const tool of agent.tools) {
    if (!allowedTools.has(tool.name)) continue;
    plan.push({
      step: 'tool_call',
      tool: tool.name,
      input: input.input,
      retryable: agent.failure?.retryable ?? false,
    });
  }

  // Delegate steps for sub-agents
  if (constraints.allowSubAgents && agent.subAgentIds?.length) {
    for (const subAgentId of agent.subAgentIds) {
      plan.push({
        step: 'delegate',
        agent: subAgentId,
        input: input.input,
      });
    }
  }

  // Emit lifecycle event at the end of every plan
  plan.push({
    step: 'event_emit',
    event: 'agent.plan.generated',
    payload: {
      agentId: agent.id,
      version: agent.version,
      stepsCount: plan.length,
    },
  });

  return plan;
}

export { AgentRunner as default };
