import { z } from 'zod';
import type {
  AgentDefinition,
  ExecutionPlan,
  AgentOutput,
  AgentInput,
} from './types.js';

// ─── Base Output Schema ───────────────────────────────────────────────────────

export const executionStepSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal('tool_call'),
    tool: z.string().min(1),
    input: z.record(z.unknown()),
    retryable: z.boolean().optional(),
  }),
  z.object({
    step: z.literal('delegate'),
    agent: z.string().min(1),
    input: z.record(z.unknown()),
  }),
  z.object({
    step: z.literal('condition'),
    expression: z.string().min(1),
    onTrue: z.array(z.lazy((): z.ZodTypeAny => executionStepSchema)),
    onFalse: z.array(z.lazy((): z.ZodTypeAny => executionStepSchema)).optional(),
  }),
  z.object({
    step: z.literal('memory_request'),
    scope: z.string().min(1),
    queryType: z.enum(['semantic', 'exact', 'hybrid']),
    query: z.string().min(1),
    limit: z.number().int().positive().optional(),
  }),
  z.object({
    step: z.literal('event_emit'),
    event: z.string().min(1),
    payload: z.record(z.unknown()),
  }),
]);

export const executionPlanSchema = z.object({
  agentId: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  plan: z.array(executionStepSchema).min(1),
  metadata: z.record(z.unknown()),
  validation: z.object({
    schemaValid: z.boolean(),
    constraintsPassed: z.boolean(),
    toolsResolved: z.boolean(),
  }),
});

export const agentOutputSchema = z.object({
  executionPlan: z.array(executionStepSchema).min(1),
  meta: z.record(z.unknown()),
  validation: z.object({
    schemaValid: z.boolean(),
    constraintsPassed: z.boolean(),
    toolsResolved: z.boolean(),
  }),
  observabilityTrace: z
    .object({
      agentId: z.string(),
      sessionId: z.string().optional(),
      decisions: z.array(
        z.object({
          step: z.number().int().nonnegative(),
          decision: z.string(),
          reasoning: z.string(),
          timestamp: z.string(),
        }),
      ),
      toolSelections: z.array(
        z.object({
          tool: z.string(),
          reason: z.string(),
          step: z.number().int().nonnegative(),
        }),
      ),
      constraintResults: z.array(
        z.object({
          constraint: z.string(),
          passed: z.boolean(),
          detail: z.string().optional(),
        }),
      ),
      timestamp: z.string(),
    })
    .optional(),
});

// ─── Validation Helpers ───────────────────────────────────────────────────────

/**
 * Validate an agent output against the standard schema.
 * Throws a ZodError if the output is invalid.
 */
export function validateAgentOutput(output: unknown): AgentOutput {
  return agentOutputSchema.parse(output) as AgentOutput;
}

/**
 * Validate an execution plan against the standard schema.
 * Throws a ZodError if the plan is invalid.
 */
export function validateExecutionPlan(plan: unknown): ExecutionPlan {
  return executionPlanSchema.parse(plan) as ExecutionPlan;
}

/**
 * Validate that an agent definition meets the minimum required fields.
 */
export function validateAgentDefinition(def: AgentDefinition): boolean {
  if (!def.id || !def.name || !def.version || !def.description) {
    throw new Error(
      `Agent definition missing required fields: id, name, version, description`,
    );
  }
  if (!def.tools || def.tools.length === 0) {
    throw new Error(`Agent "${def.id}" must declare at least one tool`);
  }
  if (!def.constraints) {
    throw new Error(`Agent "${def.id}" must declare constraints`);
  }
  return true;
}

/**
 * Sanitize and normalize agent output — ensures strict format compliance.
 */
export function sanitizeAgentOutput(raw: unknown): AgentOutput {
  const result = agentOutputSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Agent produced invalid output: ${result.error.message}`,
    );
  }
  return result.data as AgentOutput;
}

/**
 * Build an AgentInput from loose parameters with defaults applied.
 */
export function buildAgentInput(params: Partial<AgentInput>): AgentInput {
  return {
    input: params.input ?? {},
    context: params.context,
    constraints: params.constraints,
    tools: params.tools,
    environment: params.environment ?? 'production',
    sessionId: params.sessionId,
  };
}
