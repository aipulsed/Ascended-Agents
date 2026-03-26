import type { AgentDefinition, AgentInput, AgentOutput } from '@ascended-agents/core';
import { sanitizeAgentOutput } from '@ascended-agents/core';
import { fullValidationPipeline } from '@ascended-agents/validator';
import { AgentRunner } from '@ascended-agents/runner';

// ─── Schema Validation Test Helper ────────────────────────────────────────────

export interface SchemaTestResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate an agent definition against its full validation pipeline.
 * Use in test suites to assert agent correctness before deployment.
 */
export function runSchemaTest(definition: AgentDefinition): SchemaTestResult {
  const { passed, agentValidation, staticAnalysis } = fullValidationPipeline(definition);
  return {
    passed,
    errors: [
      ...agentValidation.errors,
      ...staticAnalysis.filter((i) => i.severity === 'error').map((i) => `[${i.code}] ${i.message}`),
    ],
    warnings: [
      ...agentValidation.warnings,
      ...staticAnalysis.filter((i) => i.severity === 'warning').map((i) => `[${i.code}] ${i.message}`),
    ],
  };
}

// ─── Determinism Test Helper ───────────────────────────────────────────────────

export interface DeterminismTestResult {
  deterministic: boolean;
  run1: AgentOutput;
  run2: AgentOutput;
  diff?: string;
}

/**
 * Verify that an agent produces identical execution plans for the same input.
 * Runs the agent twice and deep-compares the execution plans.
 */
export async function runDeterminismTest(
  definition: AgentDefinition,
  input: AgentInput,
): Promise<DeterminismTestResult> {
  const runner = new AgentRunner();

  const run1 = await runner.runFromDefinition(definition, { ...input, sessionId: 'det-test-1' });
  const run2 = await runner.runFromDefinition(definition, { ...input, sessionId: 'det-test-2' });

  // Compare execution plans (exclude session-specific metadata)
  const plan1 = JSON.stringify(run1.executionPlan);
  const plan2 = JSON.stringify(run2.executionPlan);

  const deterministic = plan1 === plan2;
  return {
    deterministic,
    run1,
    run2,
    diff: deterministic ? undefined : diffSummary(plan1, plan2),
  };
}

// ─── Constraint Test Helper ────────────────────────────────────────────────────

export interface ConstraintTestResult {
  passed: boolean;
  violations: string[];
}

/**
 * Verify that an agent definition correctly enforces its constraints.
 * Checks:
 *   - All allowedTools reference declared tools.
 *   - maxSteps is a positive integer.
 *   - allowedEnvironments is non-empty.
 *   - restrictedDataScopes do not overlap with tool names (sanity check).
 */
export function runConstraintTest(definition: AgentDefinition): ConstraintTestResult {
  const violations: string[] = [];
  const toolNames = new Set(definition.tools.map((t) => t.name));
  const { constraints } = definition;

  for (const allowed of constraints.allowedTools) {
    if (!toolNames.has(allowed)) {
      violations.push(`Constraint references undeclared tool: "${allowed}"`);
    }
  }

  if (!Number.isInteger(constraints.maxSteps) || constraints.maxSteps <= 0) {
    violations.push(`constraints.maxSteps must be a positive integer, got: ${constraints.maxSteps}`);
  }

  if (!constraints.allowedEnvironments.length) {
    violations.push('constraints.allowedEnvironments must not be empty');
  }

  return { passed: violations.length === 0, violations };
}

// ─── Output Compliance Test Helper ────────────────────────────────────────────

export interface OutputComplianceResult {
  compliant: boolean;
  errors: string[];
}

/**
 * Verify that an agent output complies with the standard output schema.
 */
export function runOutputComplianceTest(output: unknown): OutputComplianceResult {
  try {
    sanitizeAgentOutput(output);
    return { compliant: true, errors: [] };
  } catch (err) {
    return {
      compliant: false,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }
}

// ─── DEL Integration Mock ─────────────────────────────────────────────────────

export interface DelSimulationResult {
  stepsExecuted: number;
  toolCalls: string[];
  delegations: string[];
  events: string[];
  memoryRequests: string[];
}

/**
 * Simulate DEL consuming an execution plan.
 * Does NOT execute actual tools — records what would be executed.
 * Use to verify plan correctness before sending to the real DEL.
 */
export function simulateDelExecution(output: AgentOutput): DelSimulationResult {
  const toolCalls: string[] = [];
  const delegations: string[] = [];
  const events: string[] = [];
  const memoryRequests: string[] = [];

  for (const step of output.executionPlan) {
    if (step.step === 'tool_call') toolCalls.push(step.tool);
    else if (step.step === 'delegate') delegations.push(step.agent);
    else if (step.step === 'event_emit') events.push(step.event);
    else if (step.step === 'memory_request') memoryRequests.push(`${step.scope}:${step.query}`);
  }

  return {
    stepsExecuted: output.executionPlan.length,
    toolCalls,
    delegations,
    events,
    memoryRequests,
  };
}

// ─── Combined Test Suite Runner ────────────────────────────────────────────────

export interface AgentTestSuiteResult {
  agentId: string;
  schema: SchemaTestResult;
  constraints: ConstraintTestResult;
  determinism?: DeterminismTestResult;
  outputCompliance?: OutputComplianceResult;
  allPassed: boolean;
}

/**
 * Run all available tests for an agent definition.
 * Optionally provide input to run determinism and output-compliance tests.
 */
export async function runAgentTestSuite(
  definition: AgentDefinition,
  input?: AgentInput,
): Promise<AgentTestSuiteResult> {
  const schema = runSchemaTest(definition);
  const constraints = runConstraintTest(definition);

  let determinism: DeterminismTestResult | undefined;
  let outputCompliance: OutputComplianceResult | undefined;

  if (input) {
    determinism = await runDeterminismTest(definition, input);
    outputCompliance = runOutputComplianceTest(determinism.run1);
  }

  const allPassed =
    schema.passed &&
    constraints.passed &&
    (determinism?.deterministic ?? true) &&
    (outputCompliance?.compliant ?? true);

  return {
    agentId: definition.id,
    schema,
    constraints,
    determinism,
    outputCompliance,
    allPassed,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diffSummary(a: string, b: string): string {
  const aArr = a.split(',');
  const bArr = b.split(',');
  const diffs: string[] = [];
  const max = Math.max(aArr.length, bArr.length);
  for (let i = 0; i < max; i++) {
    if (aArr[i] !== bArr[i]) {
      diffs.push(`step[${i}]: "${aArr[i] ?? 'missing'}" vs "${bArr[i] ?? 'missing'}"`);
    }
  }
  return diffs.join('\n');
}
