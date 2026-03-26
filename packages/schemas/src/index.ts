import { z } from 'zod';

// ─── Semantic Version ──────────────────────────────────────────────────────────

export const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be a valid semver string (e.g. 1.0.0)');

// ─── Environment ───────────────────────────────────────────────────────────────

export const environmentSchema = z.enum(['dev', 'staging', 'production']);

// ─── Policy Rule ───────────────────────────────────────────────────────────────

export const policyRuleSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  condition: z.string().min(1),
  action: z.enum(['deny', 'warn', 'escalate']),
});

// ─── Constraint ────────────────────────────────────────────────────────────────

export const constraintSchema = z.object({
  allowedTools: z.array(z.string().min(1)).min(1),
  maxSteps: z.number().int().positive(),
  restrictedDataScopes: z.array(z.string()).optional(),
  allowedEnvironments: z.array(environmentSchema).min(1),
  maxExecutionTimeMs: z.number().int().positive().optional(),
  allowSubAgents: z.boolean().optional(),
  policies: z.array(policyRuleSchema).optional(),
});

// ─── Memory Request ────────────────────────────────────────────────────────────

export const memoryRequestSchema = z.object({
  required: z.boolean(),
  queryType: z.enum(['semantic', 'exact', 'hybrid']),
  scope: z.string().min(1),
  limit: z.number().int().positive().optional(),
});

// ─── Failure Strategy ──────────────────────────────────────────────────────────

export const failureStrategySchema = z.object({
  retryable: z.boolean(),
  maxRetries: z.number().int().nonnegative().optional(),
  fallbackAgent: z.string().optional(),
  escalation: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

// ─── Observability ─────────────────────────────────────────────────────────────

export const observabilitySchema = z.object({
  traceDecisions: z.boolean(),
  traceToolSelection: z.boolean(),
  traceConstraints: z.boolean(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
});

// ─── Tool ──────────────────────────────────────────────────────────────────────

export const toolDefinitionJsonSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  version: semverSchema,
  tags: z.array(z.string()).optional(),
  /** JSON Schema representation of input (for serialisation/docs) */
  inputSchemaJson: z.record(z.unknown()).optional(),
  /** JSON Schema representation of output (for serialisation/docs) */
  outputSchemaJson: z.record(z.unknown()).optional(),
});

// ─── Agent Definition (JSON-serialisable form) ────────────────────────────────

export const agentDefinitionJsonSchema = z.object({
  id: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/, 'Agent IDs must be kebab-case'),
  name: z.string().min(1),
  description: z.string().min(1),
  version: semverSchema,
  tools: z.array(toolDefinitionJsonSchema).min(1),
  constraints: constraintSchema,
  prompt: z.string().min(1),
  parentAgentId: z.string().optional(),
  subAgentIds: z.array(z.string()).optional(),
  memory: memoryRequestSchema.optional(),
  failure: failureStrategySchema.optional(),
  observability: observabilitySchema,
  environmentOverrides: z.record(z.string(), constraintSchema.partial()).optional(),
  plugins: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        version: semverSchema,
        source: z.string().min(1),
        validated: z.boolean(),
        config: z.record(z.unknown()).optional(),
      }),
    )
    .optional(),
});

// ─── Execution Step Schemas ───────────────────────────────────────────────────

export const toolCallStepSchema = z.object({
  step: z.literal('tool_call'),
  tool: z.string().min(1),
  input: z.record(z.unknown()),
  retryable: z.boolean().optional(),
});

export const delegateStepSchema = z.object({
  step: z.literal('delegate'),
  agent: z.string().min(1),
  input: z.record(z.unknown()),
});

export const memoryRequestStepSchema = z.object({
  step: z.literal('memory_request'),
  scope: z.string().min(1),
  queryType: z.enum(['semantic', 'exact', 'hybrid']),
  query: z.string().min(1),
  limit: z.number().int().positive().optional(),
});

export const eventEmitStepSchema = z.object({
  step: z.literal('event_emit'),
  event: z.string().min(1),
  payload: z.record(z.unknown()),
});

export const executionStepJsonSchema: z.ZodTypeAny = z.discriminatedUnion('step', [
  toolCallStepSchema,
  delegateStepSchema,
  memoryRequestStepSchema,
  eventEmitStepSchema,
]);

// ─── Agent Output ─────────────────────────────────────────────────────────────

export const agentOutputJsonSchema = z.object({
  executionPlan: z.array(executionStepJsonSchema).min(1),
  meta: z.record(z.unknown()),
  validation: z.object({
    schemaValid: z.boolean(),
    constraintsPassed: z.boolean(),
    toolsResolved: z.boolean(),
  }),
});

// ─── Agent Event ──────────────────────────────────────────────────────────────

export const agentEventSchema = z.object({
  event: z.string().min(1),
  agentId: z.string().min(1),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime(),
  result: agentOutputJsonSchema.partial().optional(),
  error: z.string().optional(),
});

export type AgentDefinitionJson = z.infer<typeof agentDefinitionJsonSchema>;
export type ToolDefinitionJson = z.infer<typeof toolDefinitionJsonSchema>;
export type AgentOutputJson = z.infer<typeof agentOutputJsonSchema>;
export type AgentEventJson = z.infer<typeof agentEventSchema>;
export type ConstraintJson = z.infer<typeof constraintSchema>;
