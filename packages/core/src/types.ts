import { z } from 'zod';

// ─── Environment ──────────────────────────────────────────────────────────────

export type Environment = 'dev' | 'staging' | 'production';

// ─── Tool Definition ──────────────────────────────────────────────────────────

export interface ToolDefinition {
  /** Unique tool identifier */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** Zod schema for tool input validation */
  inputSchema: z.ZodTypeAny;
  /** Zod schema for tool output validation */
  outputSchema: z.ZodTypeAny;
  /** Semantic version of the tool contract */
  version: string;
  /** Optional tags for tool discovery */
  tags?: string[];
}

// ─── Constraint ───────────────────────────────────────────────────────────────

export interface Constraint {
  /** Names of tools this agent is permitted to use */
  allowedTools: string[];
  /** Maximum number of steps in an execution plan */
  maxSteps: number;
  /** Data scopes the agent is restricted from accessing */
  restrictedDataScopes?: string[];
  /** Environments where this agent may operate */
  allowedEnvironments: Environment[];
  /** Maximum execution time in milliseconds */
  maxExecutionTimeMs?: number;
  /** Whether the agent can spawn sub-agents */
  allowSubAgents?: boolean;
  /** Named policy rules that further restrict behaviour */
  policies?: PolicyRule[];
}

export interface PolicyRule {
  id: string;
  description: string;
  /** The condition expression (evaluated externally by DEL) */
  condition: string;
  /** Action to take when the condition is violated */
  action: 'deny' | 'warn' | 'escalate';
}

// ─── Memory Request ───────────────────────────────────────────────────────────

export interface MemoryRequest {
  required: boolean;
  queryType: 'semantic' | 'exact' | 'hybrid';
  scope: string;
  limit?: number;
}

// ─── Failure Strategy ─────────────────────────────────────────────────────────

export interface FailureStrategy {
  retryable: boolean;
  maxRetries?: number;
  fallbackAgent?: string;
  escalation?: string;
  /** Conditions that trigger the fallback (e.g. "schema_validation_failed") */
  conditions?: string[];
}

// ─── Observability Hook ───────────────────────────────────────────────────────

export interface ObservabilityConfig {
  /** Emit decision-trace events */
  traceDecisions: boolean;
  /** Emit tool-selection reasoning */
  traceToolSelection: boolean;
  /** Emit constraint-enforcement results */
  traceConstraints: boolean;
  /** Log level for this agent */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// ─── Execution Plan Step ──────────────────────────────────────────────────────

export type ExecutionStepType = 'tool_call' | 'delegate' | 'condition' | 'memory_request' | 'event_emit';

export interface ToolCallStep {
  step: 'tool_call';
  tool: string;
  input: Record<string, unknown>;
  retryable?: boolean;
}

export interface DelegateStep {
  step: 'delegate';
  agent: string;
  input: Record<string, unknown>;
}

export interface ConditionStep {
  step: 'condition';
  expression: string;
  onTrue: ExecutionStep[];
  onFalse?: ExecutionStep[];
}

export interface MemoryRequestStep {
  step: 'memory_request';
  scope: string;
  queryType: 'semantic' | 'exact' | 'hybrid';
  query: string;
  limit?: number;
}

export interface EventEmitStep {
  step: 'event_emit';
  event: string;
  payload: Record<string, unknown>;
}

export type ExecutionStep =
  | ToolCallStep
  | DelegateStep
  | ConditionStep
  | MemoryRequestStep
  | EventEmitStep;

// ─── Execution Plan ───────────────────────────────────────────────────────────

export interface ExecutionPlan {
  agentId: string;
  version: string;
  plan: ExecutionStep[];
  metadata: Record<string, unknown>;
  validation: {
    schemaValid: boolean;
    constraintsPassed: boolean;
    toolsResolved: boolean;
  };
}

// ─── Compiled Agent ───────────────────────────────────────────────────────────

export interface CompiledAgent {
  id: string;
  version: string;
  validated: true;
  executionBlueprint: AgentDefinition;
  compiledAt: string;
  checksum: string;
}

// ─── Agent Definition ─────────────────────────────────────────────────────────

export interface AgentDefinition {
  /** Unique identifier for the agent (kebab-case) */
  id: string;
  /** Human-readable agent name */
  name: string;
  /** Description of what the agent is responsible for */
  description: string;
  /** Semantic version */
  version: string;
  /** Zod schema for validating agent inputs */
  inputSchema: z.ZodTypeAny;
  /** Zod schema for validating agent outputs */
  outputSchema: z.ZodTypeAny;
  /** Tools available to this agent (references only — not implementations) */
  tools: ToolDefinition[];
  /** Operational constraints that gate execution */
  constraints: Constraint;
  /** Structured XML/JSON prompt definition */
  prompt: string;
  /** Optional parent agent ID for hierarchical compositions */
  parentAgentId?: string;
  /** Optional sub-agent IDs this agent may delegate to */
  subAgentIds?: string[];
  /** Memory interface configuration */
  memory?: MemoryRequest;
  /** Failure handling strategy */
  failure?: FailureStrategy;
  /** Observability configuration */
  observability: ObservabilityConfig;
  /** Environment-specific override maps */
  environmentOverrides?: Partial<Record<Environment, Partial<Constraint>>>;
  /** Plugin extensions */
  plugins?: PluginDefinition[];
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export interface PluginDefinition {
  id: string;
  name: string;
  version: string;
  /** URL or package name for dynamic loading */
  source: string;
  /** Whether the plugin has been validated */
  validated: boolean;
  config?: Record<string, unknown>;
}

// ─── Agent Input / Output ─────────────────────────────────────────────────────

export interface AgentInput {
  input: Record<string, unknown>;
  context?: Record<string, unknown>;
  constraints?: Partial<Constraint>;
  tools?: string[];
  environment?: Environment;
  sessionId?: string;
}

export interface AgentOutput {
  executionPlan: ExecutionStep[];
  meta: Record<string, unknown>;
  validation: {
    schemaValid: boolean;
    constraintsPassed: boolean;
    toolsResolved: boolean;
  };
  observabilityTrace?: ObservabilityTrace;
}

export interface ObservabilityTrace {
  agentId: string;
  sessionId?: string;
  decisions: DecisionEntry[];
  toolSelections: ToolSelectionEntry[];
  constraintResults: ConstraintResult[];
  timestamp: string;
}

export interface DecisionEntry {
  step: number;
  decision: string;
  reasoning: string;
  timestamp: string;
}

export interface ToolSelectionEntry {
  tool: string;
  reason: string;
  step: number;
}

export interface ConstraintResult {
  constraint: string;
  passed: boolean;
  detail?: string;
}

// ─── Registry Entry ───────────────────────────────────────────────────────────

export interface RegistryEntry {
  definition: AgentDefinition;
  compiled?: CompiledAgent;
  registeredAt: string;
  environment?: Environment;
}

// ─── Agent Event ──────────────────────────────────────────────────────────────

export interface AgentEvent {
  event: string;
  agentId: string;
  sessionId?: string;
  timestamp: string;
  result?: Partial<AgentOutput>;
  error?: string;
}
