import { describe, it, expect } from 'vitest';
import {
  validateAgentOutput,
  validateExecutionPlan,
  validateAgentDefinition,
  sanitizeAgentOutput,
  buildAgentInput,
} from '../src/index.js';
import { z } from 'zod';
import type { AgentDefinition } from '../src/types.js';

const minimalTool = {
  name: 'test_tool',
  description: 'A test tool',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  version: '1.0.0',
};

const minimalAgent: AgentDefinition = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'A test agent',
  version: '1.0.0',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  tools: [minimalTool],
  constraints: {
    allowedTools: ['test_tool'],
    maxSteps: 5,
    allowedEnvironments: ['dev'],
  },
  prompt: '<agent><role>test</role><instructions>test</instructions><constraints>test</constraints></agent>',
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'info',
  },
};

describe('core/validation', () => {
  it('validateAgentOutput accepts valid output', () => {
    const valid = {
      executionPlan: [{ step: 'tool_call', tool: 'test_tool', input: {} }],
      meta: {},
      validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true },
    };
    expect(() => validateAgentOutput(valid)).not.toThrow();
  });

  it('validateAgentOutput rejects empty plan', () => {
    const invalid = {
      executionPlan: [],
      meta: {},
      validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true },
    };
    expect(() => validateAgentOutput(invalid)).toThrow();
  });

  it('validateAgentDefinition passes for minimal agent', () => {
    expect(validateAgentDefinition(minimalAgent)).toBe(true);
  });

  it('validateAgentDefinition throws for missing tools', () => {
    expect(() =>
      validateAgentDefinition({ ...minimalAgent, tools: [] }),
    ).toThrow();
  });

  it('sanitizeAgentOutput returns normalised output', () => {
    const raw = {
      executionPlan: [{ step: 'tool_call', tool: 'do_thing', input: {} }],
      meta: { agentId: 'x' },
      validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true },
    };
    const result = sanitizeAgentOutput(raw);
    expect(result.executionPlan).toHaveLength(1);
    expect(result.validation.schemaValid).toBe(true);
  });

  it('buildAgentInput applies defaults', () => {
    const input = buildAgentInput({ input: { key: 'value' } });
    expect(input.environment).toBe('production');
    expect(input.input).toEqual({ key: 'value' });
  });

  it('validateExecutionPlan passes for valid plan', () => {
    const plan = {
      agentId: 'test-agent',
      version: '1.0.0',
      plan: [{ step: 'tool_call', tool: 'my_tool', input: {} }],
      metadata: {},
      validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true },
    };
    expect(() => validateExecutionPlan(plan)).not.toThrow();
  });
});
