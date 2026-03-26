import { describe, it, expect } from 'vitest';
import { fallbackAgentDefinition } from './agent.config.js';

describe('fallback-agent', () => {
  it('has required fields', () => {
    expect(fallbackAgentDefinition.id).toBe('fallback-agent');
    expect(fallbackAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(fallbackAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = fallbackAgentDefinition.tools.map((t) => t.name);
    fallbackAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(fallbackAgentDefinition.prompt).toContain('<agent>');
    expect(fallbackAgentDefinition.prompt).toContain('<role>');
    expect(fallbackAgentDefinition.prompt).toContain('<instructions>');
    expect(fallbackAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = fallbackAgentDefinition.inputSchema.safeParse({
      failedAgentId: 'some-agent',
      failureReason: 'network timeout',
    });
    expect(result).toBeDefined();
  });

  it('is not retryable (terminal handler)', () => {
    expect(fallbackAgentDefinition.failure?.retryable).toBe(false);
  });
});
