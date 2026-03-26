import { describe, it, expect } from 'vitest';
import { analyticsAgentDefinition } from './agent.config.js';

describe('analytics-agent', () => {
  it('has required fields', () => {
    expect(analyticsAgentDefinition.id).toBe('analytics-agent');
    expect(analyticsAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(analyticsAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = analyticsAgentDefinition.tools.map((t) => t.name);
    analyticsAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(analyticsAgentDefinition.prompt).toContain('<agent>');
    expect(analyticsAgentDefinition.prompt).toContain('<role>');
    expect(analyticsAgentDefinition.prompt).toContain('<instructions>');
    expect(analyticsAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = analyticsAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has observability config', () => {
    expect(analyticsAgentDefinition.observability.traceDecisions).toBe(true);
    expect(analyticsAgentDefinition.observability.logLevel).toBe('info');
  });
});
