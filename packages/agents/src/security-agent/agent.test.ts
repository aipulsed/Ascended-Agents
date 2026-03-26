import { describe, it, expect } from 'vitest';
import { securityAgentDefinition } from './agent.config.js';

describe('security-agent', () => {
  it('has required fields', () => {
    expect(securityAgentDefinition.id).toBe('security-agent');
    expect(securityAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(securityAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = securityAgentDefinition.tools.map((t) => t.name);
    securityAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(securityAgentDefinition.prompt).toContain('<agent>');
    expect(securityAgentDefinition.prompt).toContain('<role>');
    expect(securityAgentDefinition.prompt).toContain('<instructions>');
    expect(securityAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = securityAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has policies defined', () => {
    expect(securityAgentDefinition.constraints.policies?.length).toBeGreaterThan(0);
    expect(securityAgentDefinition.constraints.policies?.[0].action).toBe('escalate');
  });
});
