import { describe, it, expect } from 'vitest';
import { onboardingAgentDefinition } from './agent.config.js';

describe('onboarding-agent', () => {
  it('has required fields', () => {
    expect(onboardingAgentDefinition.id).toBe('onboarding-agent');
    expect(onboardingAgentDefinition.tools.length).toBeGreaterThan(0);
    expect(onboardingAgentDefinition.constraints.allowedTools.length).toBeGreaterThan(0);
  });

  it('tools in allowedTools are all declared', () => {
    const toolNames = onboardingAgentDefinition.tools.map((t) => t.name);
    onboardingAgentDefinition.constraints.allowedTools.forEach((allowed) => {
      expect(toolNames).toContain(allowed);
    });
  });

  it('prompt is valid XML structure', () => {
    expect(onboardingAgentDefinition.prompt).toContain('<agent>');
    expect(onboardingAgentDefinition.prompt).toContain('<role>');
    expect(onboardingAgentDefinition.prompt).toContain('<instructions>');
    expect(onboardingAgentDefinition.prompt).toContain('<constraints>');
  });

  it('input schema validates correctly', () => {
    const result = onboardingAgentDefinition.inputSchema.safeParse({
      userId: 'user-001',
      email: 'test@example.com',
    });
    expect(result).toBeDefined();
  });

  it('has restricted data scopes protecting passwords', () => {
    expect(onboardingAgentDefinition.constraints.restrictedDataScopes).toContain('passwords');
  });
});
