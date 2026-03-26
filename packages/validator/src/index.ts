import { ZodError } from 'zod';
import type { AgentDefinition, AgentOutput, ExecutionPlan } from '@ascended-agents/core';
import { validateAgentDefinition, sanitizeAgentOutput, validateExecutionPlan } from '@ascended-agents/core';
import { agentDefinitionJsonSchema, agentOutputJsonSchema } from '@ascended-agents/schemas';

// ─── Validation Result ─────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Static Analysis Issue ─────────────────────────────────────────────────────

export interface StaticAnalysisIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}

// ─── Agent Validator ───────────────────────────────────────────────────────────

/**
 * Validate a JSON-serialisable agent definition.
 * Returns a ValidationResult describing all errors and warnings.
 */
export function validateAgent(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Structural validation via Zod
  const result = agentDefinitionJsonSchema.safeParse(raw);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.push(`[${issue.path.join('.')}] ${issue.message}`);
    });
  }

  // Additional semantic validation
  if (typeof raw === 'object' && raw !== null) {
    const def = raw as Record<string, unknown>;

    // Warn if no failure strategy defined
    if (!def.failure) {
      warnings.push('No failure strategy defined. Consider adding failure.retryable and fallback config.');
    }

    // Warn if memory not configured
    if (!def.memory) {
      warnings.push('No memory configuration defined. If context injection is needed, add a memory block.');
    }

    // Warn if no environment overrides
    if (!def.environmentOverrides) {
      warnings.push('No environment overrides defined. Agents should configure per-environment constraints.');
    }

    // Error if prompt is empty
    if (typeof def.prompt === 'string' && def.prompt.trim().length === 0) {
      errors.push('Agent prompt must not be empty.');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Run static analysis on an agent definition.
 * Detects invalid tool usage, schema mismatches, and constraint violations
 * without executing the agent.
 */
export function staticAnalyzeAgent(raw: unknown): StaticAnalysisIssue[] {
  const issues: StaticAnalysisIssue[] = [];

  if (typeof raw !== 'object' || raw === null) {
    issues.push({ severity: 'error', code: 'INVALID_STRUCTURE', message: 'Agent definition must be an object.' });
    return issues;
  }

  const def = raw as Record<string, unknown>;

  // Check tool names are kebab-case identifiers
  const tools = Array.isArray(def.tools) ? def.tools : [];
  for (const tool of tools) {
    if (typeof tool === 'object' && tool !== null) {
      const t = tool as Record<string, unknown>;
      if (typeof t.name === 'string' && !/^[a-z][a-z0-9_-]*$/.test(t.name)) {
        issues.push({
          severity: 'warning',
          code: 'TOOL_NAMING',
          message: `Tool name "${t.name}" should be lowercase with underscores or hyphens.`,
          field: `tools[${t.name}].name`,
        });
      }
    }
  }

  // Validate allowed tools reference declared tools
  const declaredToolNames = tools
    .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
    .map((t) => t.name as string);

  const constraints = def.constraints as Record<string, unknown> | undefined;
  if (constraints && Array.isArray(constraints.allowedTools)) {
    for (const allowed of constraints.allowedTools) {
      if (!declaredToolNames.includes(allowed as string)) {
        issues.push({
          severity: 'error',
          code: 'UNDECLARED_TOOL',
          message: `Constraint references tool "${allowed}" which is not declared in tools array.`,
          field: 'constraints.allowedTools',
        });
      }
    }
  }

  // Check sub-agents
  if (Array.isArray(def.subAgentIds)) {
    if (!constraints?.allowSubAgents) {
      issues.push({
        severity: 'error',
        code: 'SUB_AGENT_NOT_ALLOWED',
        message: 'Agent declares subAgentIds but constraints.allowSubAgents is not true.',
        field: 'constraints.allowSubAgents',
      });
    }
  }

  // Detect potential prompt injection patterns
  if (typeof def.prompt === 'string') {
    const injectionPatterns = ['<script', 'javascript:', 'eval(', '__proto__'];
    for (const pattern of injectionPatterns) {
      if (def.prompt.toLowerCase().includes(pattern)) {
        issues.push({
          severity: 'error',
          code: 'PROMPT_INJECTION_RISK',
          message: `Prompt contains potentially unsafe pattern: "${pattern}".`,
          field: 'prompt',
        });
      }
    }
  }

  return issues;
}

/**
 * Validate an agent output.
 */
export function validateOutput(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const result = agentOutputJsonSchema.safeParse(raw);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.push(`[${issue.path.join('.')}] ${issue.message}`);
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Full validation pipeline — schema, constraints, tool resolution.
 * Use before agent is deployed / made available.
 */
export function fullValidationPipeline(raw: unknown): {
  agentValidation: ValidationResult;
  staticAnalysis: StaticAnalysisIssue[];
  passed: boolean;
} {
  const agentValidation = validateAgent(raw);
  const staticAnalysis = staticAnalyzeAgent(raw);

  const hasErrors = !agentValidation.valid || staticAnalysis.some((i) => i.severity === 'error');

  return {
    agentValidation,
    staticAnalysis,
    passed: !hasErrors,
  };
}

export { validateAgentDefinition, sanitizeAgentOutput, validateExecutionPlan };
export type { AgentDefinition, AgentOutput, ExecutionPlan, ZodError };
