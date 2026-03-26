import { describe, it, expect } from 'vitest';
import { invoiceAgentDefinition } from './agent.config.js';

describe('invoice-agent', () => {
  it('has required fields', () => {
    expect(invoiceAgentDefinition.id).toBe('invoice-agent');
    expect(invoiceAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(invoiceAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = invoiceAgentDefinition.tools.map((t) => t.name);
    invoiceAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(invoiceAgentDefinition.prompt).toContain('<agent>');
    expect(invoiceAgentDefinition.prompt).toContain('<role>');
    expect(invoiceAgentDefinition.prompt).toContain('<instructions>');
    expect(invoiceAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = invoiceAgentDefinition.inputSchema.safeParse({ customerId: 'cust-001' });
    expect(result).toBeDefined();
  });

  it('has a parentAgentId of billing-agent', () => {
    expect(invoiceAgentDefinition.parentAgentId).toBe('billing-agent');
  });
});
