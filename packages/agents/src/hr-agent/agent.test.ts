import { describe, it, expect } from 'vitest';
import { hrAgentDefinition } from './agent.config.js';

describe('hr-agent', () => {
  it('has required fields', () => {
    expect(hrAgentDefinition.id).toBe('hr-agent');
    expect(hrAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(hrAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = hrAgentDefinition.tools.map((t) => t.name);
    hrAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(hrAgentDefinition.prompt).toContain('<agent>');
    expect(hrAgentDefinition.prompt).toContain('<role>');
    expect(hrAgentDefinition.prompt).toContain('<instructions>');
    expect(hrAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = hrAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has salary_data in restricted scopes', () => {
    expect(hrAgentDefinition.constraints.restrictedDataScopes).toContain('salary_data');
  });
});
