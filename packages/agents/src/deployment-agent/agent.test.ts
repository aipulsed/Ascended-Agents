import { describe, it, expect } from 'vitest';
import { deploymentAgentDefinition } from './agent.config.js';

describe('deployment-agent', () => {
  it('has required fields', () => {
    expect(deploymentAgentDefinition.id).toBe('deployment-agent');
    expect(deploymentAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(deploymentAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = deploymentAgentDefinition.tools.map((t) => t.name);
    deploymentAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(deploymentAgentDefinition.prompt).toContain('<agent>');
    expect(deploymentAgentDefinition.prompt).toContain('<role>');
    expect(deploymentAgentDefinition.prompt).toContain('<instructions>');
    expect(deploymentAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = deploymentAgentDefinition.inputSchema.safeParse({});
    expect(result).toBeDefined();
  });

  it('has production approval policy', () => {
    const policy = deploymentAgentDefinition.constraints.policies?.find(
      (p) => p.id === 'production-approval-required',
    );
    expect(policy).toBeDefined();
    expect(policy?.action).toBe('deny');
  });
});
