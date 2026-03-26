import { describe, it, expect } from 'vitest';
import { researchAgentDefinition } from './agent.config.js';

describe('research-agent', () => {
  it('has required fields', () => {
    expect(researchAgentDefinition.id).toBe('research-agent');
    expect(researchAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(researchAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = researchAgentDefinition.tools.map((t) => t.name);
    researchAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(researchAgentDefinition.prompt).toContain('<agent>');
    expect(researchAgentDefinition.prompt).toContain('<role>');
    expect(researchAgentDefinition.prompt).toContain('<instructions>');
    expect(researchAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = researchAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has memory configured as required', () => {
    expect(researchAgentDefinition.memory?.required).toBe(true);
    expect(researchAgentDefinition.memory?.queryType).toBe('semantic');
  });
});
