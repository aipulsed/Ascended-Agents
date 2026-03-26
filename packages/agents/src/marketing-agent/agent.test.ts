import { describe, it, expect } from 'vitest';
import { marketingAgentDefinition } from './agent.config.js';

describe('marketing-agent', () => {
  it('has required fields', () => {
    expect(marketingAgentDefinition.id).toBe('marketing-agent');
    expect(marketingAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(marketingAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = marketingAgentDefinition.tools.map((t) => t.name);
    marketingAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(marketingAgentDefinition.prompt).toContain('<agent>');
    expect(marketingAgentDefinition.prompt).toContain('<role>');
    expect(marketingAgentDefinition.prompt).toContain('<instructions>');
    expect(marketingAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = marketingAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has observability config', () => {
    expect(marketingAgentDefinition.observability).toBeDefined();
    expect(marketingAgentDefinition.observability.traceToolSelection).toBe(true);
  });
});
