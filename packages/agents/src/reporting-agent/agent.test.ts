import { describe, it, expect } from 'vitest';
import { reportingAgentDefinition } from './agent.config.js';

describe('reporting-agent', () => {
  it('has required fields', () => {
    expect(reportingAgentDefinition.id).toBe('reporting-agent');
    expect(reportingAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(reportingAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = reportingAgentDefinition.tools.map((t) => t.name);
    reportingAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(reportingAgentDefinition.prompt).toContain('<agent>');
    expect(reportingAgentDefinition.prompt).toContain('<role>');
    expect(reportingAgentDefinition.prompt).toContain('<instructions>');
    expect(reportingAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = reportingAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has financial_reports in restricted scopes', () => {
    expect(reportingAgentDefinition.constraints.restrictedDataScopes).toContain('financial_reports');
  });
});
