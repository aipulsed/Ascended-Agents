import { describe, it, expect } from 'vitest';
import { billingAgentDefinition } from './agent.config.js';

describe('billing-agent', () => {
  it('has required fields', () => {
    expect(billingAgentDefinition.id).toBe('billing-agent');
    expect(billingAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(billingAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = billingAgentDefinition.tools.map((t) => t.name);
    billingAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(billingAgentDefinition.prompt).toContain('<agent>');
    expect(billingAgentDefinition.prompt).toContain('<role>');
    expect(billingAgentDefinition.prompt).toContain('<instructions>');
    expect(billingAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = billingAgentDefinition.inputSchema.safeParse({ customerId: 'cust-001' });
    expect(result).toBeDefined();
  });

  it('has restricted data scopes', () => {
    expect(billingAgentDefinition.constraints.restrictedDataScopes).toContain('pci_data');
  });
});
