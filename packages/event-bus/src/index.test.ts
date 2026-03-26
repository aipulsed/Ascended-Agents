import { describe, it, expect } from 'vitest';
import {
  AgentEventEmitter,
  AGENT_EVENT_TYPES,
  type IEventBus,
  type PublishOptions,
} from '../src/index.js';

// Simple in-memory mock matching the IEventBus contract
function createMockBus(): IEventBus & { published: Array<{ type: string; payload: unknown }> } {
  const published: Array<{ type: string; payload: unknown }> = [];
  return {
    published,
    async publish(eventType: string, payload: unknown, _opts?: PublishOptions) {
      published.push({ type: eventType, payload });
    },
    subscribe() {
      return () => {};
    },
    async shutdown() {},
  };
}

describe('event-bus adapter', () => {
  it('AGENT_EVENT_TYPES has expected constants', () => {
    expect(AGENT_EVENT_TYPES.PLAN_GENERATED).toBe('agent.plan.generated');
    expect(AGENT_EVENT_TYPES.EXECUTED).toBe('agent.executed');
    expect(AGENT_EVENT_TYPES.ERROR).toBe('agent.error');
  });

  it('AgentEventEmitter.planGenerated publishes correct event type', async () => {
    const bus = createMockBus();
    const emitter = new AgentEventEmitter(bus);
    await emitter.planGenerated('invoice-agent', {
      executionPlan: [{ step: 'tool_call', tool: 'create_invoice', input: {} }],
      meta: {},
    });
    expect(bus.published).toHaveLength(1);
    expect(bus.published[0].type).toBe(AGENT_EVENT_TYPES.PLAN_GENERATED);
    expect((bus.published[0].payload as { agentId: string }).agentId).toBe('invoice-agent');
  });

  it('AgentEventEmitter.error emits correct event type', async () => {
    const bus = createMockBus();
    const emitter = new AgentEventEmitter(bus);
    await emitter.error('coding-agent', { message: 'build failed' });
    expect(bus.published[0].type).toBe(AGENT_EVENT_TYPES.ERROR);
  });

  it('AgentEventEmitter.executed emits with result', async () => {
    const bus = createMockBus();
    const emitter = new AgentEventEmitter(bus);
    const result = {
      executionPlan: [],
      meta: {},
      validation: { schemaValid: true, constraintsPassed: true, toolsResolved: true },
    };
    await emitter.executed('billing-agent', { result });
    expect(bus.published[0].type).toBe(AGENT_EVENT_TYPES.EXECUTED);
  });
});
