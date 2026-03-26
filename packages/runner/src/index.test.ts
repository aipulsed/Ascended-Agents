import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRunner } from '../src/index.js';
import { registerAgent, clearRegistry } from '@ascended-agents/registry';
import { z } from 'zod';
import type { AgentDefinition } from '@ascended-agents/core';

const testAgent: AgentDefinition = {
  id: 'test-runner-agent',
  name: 'Test Runner Agent',
  description: 'A minimal agent for runner tests',
  version: '1.0.0',
  inputSchema: z.object({ projectPath: z.string() }),
  outputSchema: z.object({}),
  tools: [
    {
      name: 'lint_code',
      description: 'Lint code',
      inputSchema: z.object({}),
      outputSchema: z.object({}),
      version: '1.0.0',
    },
  ],
  constraints: {
    allowedTools: ['lint_code'],
    maxSteps: 10,
    allowedEnvironments: ['dev', 'production'],
  },
  prompt: '<agent><role>test</role><instructions>run tests</instructions><constraints>none</constraints></agent>',
  observability: { traceDecisions: true, traceToolSelection: true, traceConstraints: true, logLevel: 'info' },
};

describe('AgentRunner', () => {
  beforeEach(() => clearRegistry());

  it('runFromDefinition produces a valid execution plan', async () => {
    const runner = new AgentRunner();
    const output = await runner.runFromDefinition(testAgent, {
      input: { projectPath: '/tmp/project' },
      environment: 'dev',
    });
    expect(output.executionPlan.length).toBeGreaterThan(0);
    expect(output.validation.schemaValid).toBe(true);
    expect(output.validation.constraintsPassed).toBe(true);
  });

  it('run via registry resolves agent and generates plan', async () => {
    registerAgent(testAgent, 'dev');
    const runner = new AgentRunner();
    const output = await runner.run('test-runner-agent', {
      input: { projectPath: '/tmp/project' },
      environment: 'dev',
    });
    expect(output.executionPlan.length).toBeGreaterThan(0);
    expect(output.meta.agentId).toBe('test-runner-agent');
  });

  it('is deterministic — same input produces same plan', async () => {
    const runner = new AgentRunner();
    const input = { input: { projectPath: '/tmp' }, environment: 'dev' as const, sessionId: 'fixed-session' };
    const out1 = await runner.runFromDefinition(testAgent, input);
    const out2 = await runner.runFromDefinition(testAgent, input);
    expect(JSON.stringify(out1.executionPlan)).toBe(JSON.stringify(out2.executionPlan));
  });

  it('plan only contains allowed tools', async () => {
    const runner = new AgentRunner();
    const output = await runner.runFromDefinition(testAgent, { input: { projectPath: '/tmp' } });
    const toolCalls = output.executionPlan
      .filter((s) => s.step === 'tool_call')
      .map((s) => (s as { step: 'tool_call'; tool: string }).tool);
    toolCalls.forEach((tool) => {
      expect(testAgent.constraints.allowedTools).toContain(tool);
    });
  });
});
