import type { AgentDefinition, CompiledAgent } from '@ascended-agents/core';
import { validateAgentDefinition } from '@ascended-agents/core';
import { fullValidationPipeline, type ValidationResult, type StaticAnalysisIssue } from '@ascended-agents/validator';
import { createHash } from 'crypto';

// ─── Compiled Agent ────────────────────────────────────────────────────────────

export interface CompileResult {
  compiled: CompiledAgent;
  validation: ValidationResult;
  staticAnalysis: StaticAnalysisIssue[];
}

/**
 * Compile an agent definition into a validated, checksummed execution blueprint.
 *
 * Compilation:
 *   1. Runs the full validation pipeline (schema + static analysis).
 *   2. Throws if validation fails.
 *   3. Returns a CompiledAgent with a deterministic checksum.
 *
 * The resulting CompiledAgent can be attached to the registry via
 * `attachCompiledAgent()` and used by DEL for zero-transformation execution.
 */
export function compileAgent(definition: AgentDefinition): CompileResult {
  validateAgentDefinition(definition);

  const { passed, agentValidation, staticAnalysis } = fullValidationPipeline(definition);

  if (!passed) {
    const errors = [
      ...agentValidation.errors,
      ...staticAnalysis.filter((i) => i.severity === 'error').map((i) => i.message),
    ];
    throw new Error(`Agent compilation failed for "${definition.id}":\n${errors.join('\n')}`);
  }

  const checksum = buildChecksum(definition);

  const compiled: CompiledAgent = {
    id: definition.id,
    version: definition.version,
    validated: true,
    executionBlueprint: definition,
    compiledAt: new Date().toISOString(),
    checksum,
  };

  return { compiled, validation: agentValidation, staticAnalysis };
}

function buildChecksum(definition: AgentDefinition): string {
  // Checksum covers the stable, serialisable parts of the definition.
  const stable = JSON.stringify({
    id: definition.id,
    version: definition.version,
    tools: definition.tools.map((t) => ({ name: t.name, version: t.version })),
    constraints: definition.constraints,
    prompt: definition.prompt,
  });
  return createHash('sha256').update(stable).digest('hex');
}
