import { describe, it, expect } from 'vitest';
import { crmAgentDefinition } from './agent.config.js';

describe('crm-agent', () => {
  it('has required fields', () => {
    expect(crmAgentDefinition.id).toBe('crm-agent');
    expect(crmAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(crmAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = crmAgentDefinition.tools.map((t) => t.name);
    crmAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(crmAgentDefinition.prompt).toContain('<agent>');
    expect(crmAgentDefinition.prompt).toContain('<role>');
    expect(crmAgentDefinition.prompt).toContain('<instructions>');
    expect(crmAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = crmAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has memory configured', () => {
    expect(crmAgentDefinition.memory).toBeDefined();
    expect(crmAgentDefinition.memory?.required).toBe(true);
  });
});
