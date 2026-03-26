import { describe, it, expect } from 'vitest';
import { validateAgent, staticAnalyzeAgent, validateOutput, fullValidationPipeline } from '../src/index.js';

const validAgent = {
  id: 'my-agent',
  name: 'My Agent',
  description: 'A valid agent',
  version: '1.0.0',
  tools: [{ name: 'my_tool', description: 'a tool', version: '1.0.0' }],
  constraints: {
    allowedTools: ['my_tool'],
    maxSteps: 5,
    allowedEnvironments: ['dev', 'production'],
  },
  prompt: '<agent><role>test</role><instructions>test</instructions><constraints>test</constraints></agent>',
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'info',
  },
};

describe('validator', () => {
  it('validates a correct agent definition', () => {
    const result = validateAgent(validAgent);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for missing required fields', () => {
    const result = validateAgent({ id: 'x' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('staticAnalyzeAgent catches undeclared tool in constraints', () => {
    const issues = staticAnalyzeAgent({
      ...validAgent,
      constraints: { ...validAgent.constraints, allowedTools: ['my_tool', 'ghost_tool'] },
    });
    const errors = issues.filter((i) => i.severity === 'error' && i.code === 'UNDECLARED_TOOL');
    expect(errors.length).toBe(1);
  });

  it('staticAnalyzeAgent detects prompt injection', () => {
    const issues = staticAnalyzeAgent({ ...validAgent, prompt: '<script>alert(1)</script>' });
    const injectionErrors = issues.filter((i) => i.code === 'PROMPT_INJECTION_RISK');
    expect(injectionErrors.length).toBeGreaterThan(0);
  });

  it('fullValidationPipeline passes for valid agent', () => {
    const { passed } = fullValidationPipeline(validAgent);
    expect(passed).toBe(true);
  });

  it('validateOutput rejects empty plan', () => {
    const result = validateOutput({ executionPlan: [], meta: {}, validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true } });
    expect(result.valid).toBe(false);
  });

  it('validateOutput accepts valid output', () => {
    const result = validateOutput({
      executionPlan: [{ step: 'tool_call', tool: 'x', input: {} }],
      meta: {},
      validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true },
    });
    expect(result.valid).toBe(true);
  });
});
