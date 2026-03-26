import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerAgent,
  getAgent,
  listAgents,
  deregisterAgent,
  clearRegistry,
  searchAgents,
} from '../src/index.js';
import { z } from 'zod';
import type { AgentDefinition } from '@ascended-agents/core';

const makeAgent = (id: string, version = '1.0.0'): AgentDefinition => ({
  id,
  name: `${id} agent`,
  description: `Description for ${id}`,
  version,
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  tools: [{ name: 'test_tool', description: 'tool', inputSchema: z.object({}), outputSchema: z.object({}), version: '1.0.0', tags: [id] }],
  constraints: { allowedTools: ['test_tool'], maxSteps: 5, allowedEnvironments: ['dev', 'production'] },
  prompt: '<agent><role>r</role><instructions>i</instructions><constraints>c</constraints></agent>',
  observability: { traceDecisions: false, traceToolSelection: false, traceConstraints: false, logLevel: 'info' },
});

describe('registry', () => {
  beforeEach(() => clearRegistry());

  it('registerAgent and getAgent round-trip', () => {
    registerAgent(makeAgent('billing-agent'), 'dev');
    const def = getAgent('billing-agent');
    expect(def.id).toBe('billing-agent');
  });

  it('getAgent with version pin', () => {
    registerAgent(makeAgent('billing-agent', '1.0.0'));
    registerAgent(makeAgent('billing-agent', '2.0.0'));
    expect(getAgent('billing-agent', '1.0.0').version).toBe('1.0.0');
    expect(getAgent('billing-agent', '2.0.0').version).toBe('2.0.0');
  });

  it('getAgent without version returns latest', () => {
    registerAgent(makeAgent('billing-agent', '1.0.0'));
    registerAgent(makeAgent('billing-agent', '2.0.0'));
    expect(getAgent('billing-agent').version).toBe('2.0.0');
  });

  it('listAgents returns all registered agents', () => {
    registerAgent(makeAgent('agent-a'));
    registerAgent(makeAgent('agent-b'));
    expect(listAgents().length).toBe(2);
  });

  it('deregisterAgent removes the agent', () => {
    registerAgent(makeAgent('agent-x'));
    expect(deregisterAgent('agent-x', '1.0.0')).toBe(true);
    expect(() => getAgent('agent-x')).toThrow();
  });

  it('searchAgents finds by id substring', () => {
    registerAgent(makeAgent('invoice-processor'));
    registerAgent(makeAgent('email-sender'));
    const found = searchAgents('invoice');
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe('invoice-processor');
  });

  it('getAgent throws when not found', () => {
    expect(() => getAgent('nonexistent')).toThrow();
  });
});
