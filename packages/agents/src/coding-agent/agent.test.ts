import { describe, it, expect } from 'vitest';
import { codingAgentDefinition } from './agent.config.js';

describe('coding-agent', () => {
  it('has required fields', () => {
    expect(codingAgentDefinition.id).toBe('coding-agent');
    expect(codingAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(codingAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = codingAgentDefinition.tools.map((t) => t.name);
    codingAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(codingAgentDefinition.prompt).toContain('<agent>');
    expect(codingAgentDefinition.prompt).toContain('<role>');
    expect(codingAgentDefinition.prompt).toContain('<instructions>');
    expect(codingAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = codingAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has observability config', () => {
    expect(codingAgentDefinition.observability).toBeDefined();
    expect(codingAgentDefinition.observability.traceDecisions).toBe(true);
  });
});
