import { describe, it, expect } from 'vitest';
import { documentAgentDefinition } from './agent.config.js';

describe('document-agent', () => {
  it('has required fields', () => {
    expect(documentAgentDefinition.id).toBe('document-agent');
    expect(documentAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(documentAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = documentAgentDefinition.tools.map((t) => t.name);
    documentAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(documentAgentDefinition.prompt).toContain('<agent>');
    expect(documentAgentDefinition.prompt).toContain('<role>');
    expect(documentAgentDefinition.prompt).toContain('<instructions>');
    expect(documentAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = documentAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has restricted data scopes', () => {
    expect(documentAgentDefinition.constraints.restrictedDataScopes).toContain('confidential_documents');
  });
});
