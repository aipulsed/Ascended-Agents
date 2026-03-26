import { describe, it, expect } from 'vitest';
import { notificationAgentDefinition } from './agent.config.js';

describe('notification-agent', () => {
  it('has required fields', () => {
    expect(notificationAgentDefinition.id).toBe('notification-agent');
    expect(notificationAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(notificationAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = notificationAgentDefinition.tools.map((t) => t.name);
    notificationAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(notificationAgentDefinition.prompt).toContain('<agent>');
    expect(notificationAgentDefinition.prompt).toContain('<role>');
    expect(notificationAgentDefinition.prompt).toContain('<instructions>');
    expect(notificationAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = notificationAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has device_tokens in restricted scopes', () => {
    expect(notificationAgentDefinition.constraints.restrictedDataScopes).toContain('device_tokens');
  });
});
