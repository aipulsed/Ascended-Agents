import { describe, it, expect } from 'vitest';
import { testingAgentDefinition } from './agent.config.js';

describe('testing-agent', () => {
  it('has required fields', () => {
    expect(testingAgentDefinition.id).toBe('testing-agent');
    expect(testingAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(testingAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = testingAgentDefinition.tools.map((t) => t.name);
    testingAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(testingAgentDefinition.prompt).toContain('<agent>');
    expect(testingAgentDefinition.prompt).toContain('<role>');
    expect(testingAgentDefinition.prompt).toContain('<instructions>');
    expect(testingAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = testingAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has generous maxExecutionTimeMs for long test runs', () => {
    expect(testingAgentDefinition.constraints.maxExecutionTimeMs).toBeGreaterThanOrEqual(300000);
  });
});
