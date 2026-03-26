import { describe, it, expect } from 'vitest';
import {
  callAIFallback,
  createFallbackAdapter,
  StubFallbackAdapter,
} from '../src/index.js';
import type { AgentInput } from '../src/index.js';

const mockInput: AgentInput = {
  input: { projectPath: '/tmp' },
  environment: 'dev',
};

describe('ai-fallback', () => {
  it('StubFallbackAdapter returns a no-op plan', async () => {
    const adapter = new StubFallbackAdapter();
    const result = await adapter.suggest('test-agent', 'schema_failed', mockInput, { model: 'stub' });
    expect(result.model).toBe('stub');
    expect(result.agentId).toBe('test-agent');
    expect(result.suggestedPlan.length).toBeGreaterThan(0);
    expect(result.warning).toBeTruthy();
  });

  it('createFallbackAdapter returns stub for unknown model', () => {
    const adapter = createFallbackAdapter({ model: 'stub' });
    expect(adapter).toBeInstanceOf(StubFallbackAdapter);
  });

  it('callAIFallback returns a result with the correct agentId', async () => {
    const result = await callAIFallback('my-agent', 'test_condition', mockInput, { model: 'stub' });
    expect(result.agentId).toBe('my-agent');
    expect(result.condition).toBe('test_condition');
  });

  it('no-op plan step is event_emit type', async () => {
    const result = await callAIFallback('my-agent', 'failure', mockInput, { model: 'stub' });
    const step = result.suggestedPlan[0];
    expect(step.step).toBe('event_emit');
  });
});
