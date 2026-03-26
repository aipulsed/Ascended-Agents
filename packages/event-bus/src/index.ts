/**
 * @ascended-agents/event-bus
 *
 * Thin agent-lifecycle adapter over @ascendstack/ascended-event-bus.
 *
 * This package does NOT re-implement event bus logic.
 * All transport, retry, DLQ, schema-registry, and Redis/memory
 * concerns are owned by the separate Ascended-Event-Bus repository
 * (https://github.com/aipulsed/Ascended-Event-Bus).
 *
 * This adapter only:
 *   1. Mirrors the IEventBus / PublishOptions interface from Ascended-Event-Bus
 *      so the host application can inject any compatible bus instance.
 *   2. Defines the canonical agent lifecycle event names.
 *   3. Provides a typed `AgentEventEmitter` helper that wraps an
 *      `IEventBus` instance supplied by the host application / DEL.
 *   4. Exports agent event payload types so downstream consumers can
 *      register handlers without guessing the shape.
 *
 * Usage (host application is responsible for creating the bus):
 *
 *   import { createEventBus } from '@ascendstack/ascended-event-bus';
 *   import { AgentEventEmitter, AGENT_EVENT_TYPES } from '@ascended-agents/event-bus';
 *
 *   const bus = createEventBus({ mode: 'memory' });
 *   const emitter = new AgentEventEmitter(bus);
 *
 *   await emitter.planGenerated('invoice-agent', { executionPlan: [...], meta: {}, validation: {...} });
 */

import type { AgentOutput } from '@ascended-agents/core';

// ─── IEventBus interface (mirrors @ascendstack/ascended-event-bus) ────────────
//
// Defined locally so this package compiles without requiring the Ascended-Event-Bus
// package to be installed in the monorepo. The shapes are intentionally identical
// to those in aipulsed/Ascended-Event-Bus so that any bus instance created with
// `createEventBus()` from that repo satisfies this contract at runtime.

/** Options accepted by IEventBus.publish() — mirrors Ascended-Event-Bus PublishOptions */
export interface PublishOptions {
  idempotencyKey?: string;
  partitionKey?: string;
  metadata?: Record<string, unknown>;
  version?: string;
}

/** Minimal IEventBus contract required by AgentEventEmitter */
export interface IEventBus {
  publish<TPayload = unknown>(
    eventType: string,
    payload: TPayload,
    options?: PublishOptions,
  ): Promise<void>;
  subscribe<TPayload = unknown>(
    eventType: string,
    handler: (event: { type: string; payload: TPayload; id: string; timestamp: number }) => Promise<void>,
  ): () => void;
  shutdown(): Promise<void>;
}

// ─── Canonical Agent Event Type Names ────────────────────────────────────────
// Naming convention mirrors the existing bus pattern: domain.entity.action

export const AGENT_EVENT_TYPES = {
  /** Emitted when an agent successfully generates an execution plan. */
  PLAN_GENERATED: 'agent.plan.generated',
  /** Emitted when agent input / output schema validation passes. */
  VALIDATION_PASSED: 'agent.validation.passed',
  /** Emitted when agent input / output schema validation fails. */
  VALIDATION_FAILED: 'agent.validation.failed',
  /** Emitted when a constraint check is violated. */
  CONSTRAINT_VIOLATED: 'agent.constraint.violated',
  /** Emitted when the agent selects a specific tool for a plan step. */
  TOOL_SELECTED: 'agent.tool.selected',
  /** Emitted when an agent delegates work to a sub-agent. */
  DELEGATE_TRIGGERED: 'agent.delegate.triggered',
  /** Emitted when the AI-Fallback system is invoked for this agent. */
  FALLBACK_TRIGGERED: 'agent.fallback.triggered',
  /** Emitted when the agent pipeline produces an unrecoverable error. */
  ERROR: 'agent.error',
  /** Emitted when the full agent lifecycle (plan + validation) completes. */
  EXECUTED: 'agent.executed',
} as const;

export type AgentEventType = (typeof AGENT_EVENT_TYPES)[keyof typeof AGENT_EVENT_TYPES];

// ─── Payload Types ────────────────────────────────────────────────────────────

export interface AgentPlanGeneratedPayload {
  agentId: string;
  sessionId?: string;
  executionPlan: AgentOutput['executionPlan'];
  meta: AgentOutput['meta'];
}

export interface AgentValidationPayload {
  agentId: string;
  sessionId?: string;
  errors?: string[];
  warnings?: string[];
}

export interface AgentConstraintViolatedPayload {
  agentId: string;
  sessionId?: string;
  constraint: string;
  detail: string;
}

export interface AgentToolSelectedPayload {
  agentId: string;
  sessionId?: string;
  tool: string;
  step: number;
  reason?: string;
}

export interface AgentDelegateTriggeredPayload {
  agentId: string;
  sessionId?: string;
  targetAgentId: string;
  input: Record<string, unknown>;
}

export interface AgentFallbackTriggeredPayload {
  agentId: string;
  sessionId?: string;
  condition: string;
  fallbackAgent?: string;
}

export interface AgentErrorPayload {
  agentId: string;
  sessionId?: string;
  message: string;
  stack?: string;
}

export interface AgentExecutedPayload {
  agentId: string;
  sessionId?: string;
  result: AgentOutput;
}

// ─── AgentEventEmitter ────────────────────────────────────────────────────────

/**
 * Typed helper that wraps an `IEventBus` instance (from `@ascendstack/ascended-event-bus`)
 * and exposes convenience methods for each agent lifecycle event.
 *
 * The host application (DEL or AscendStack AI OS) constructs the bus and passes
 * it in — this class never owns or creates the transport.
 */
export class AgentEventEmitter {
  constructor(private readonly bus: IEventBus) {}

  async planGenerated(
    agentId: string,
    payload: Omit<AgentPlanGeneratedPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentPlanGeneratedPayload>(
      AGENT_EVENT_TYPES.PLAN_GENERATED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async validationPassed(
    agentId: string,
    payload: Omit<AgentValidationPayload, 'agentId'> = {},
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentValidationPayload>(
      AGENT_EVENT_TYPES.VALIDATION_PASSED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async validationFailed(
    agentId: string,
    payload: Omit<AgentValidationPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentValidationPayload>(
      AGENT_EVENT_TYPES.VALIDATION_FAILED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async constraintViolated(
    agentId: string,
    payload: Omit<AgentConstraintViolatedPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentConstraintViolatedPayload>(
      AGENT_EVENT_TYPES.CONSTRAINT_VIOLATED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async toolSelected(
    agentId: string,
    payload: Omit<AgentToolSelectedPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentToolSelectedPayload>(
      AGENT_EVENT_TYPES.TOOL_SELECTED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async delegateTriggered(
    agentId: string,
    payload: Omit<AgentDelegateTriggeredPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentDelegateTriggeredPayload>(
      AGENT_EVENT_TYPES.DELEGATE_TRIGGERED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async fallbackTriggered(
    agentId: string,
    payload: Omit<AgentFallbackTriggeredPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentFallbackTriggeredPayload>(
      AGENT_EVENT_TYPES.FALLBACK_TRIGGERED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async error(
    agentId: string,
    payload: Omit<AgentErrorPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentErrorPayload>(
      AGENT_EVENT_TYPES.ERROR,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }

  async executed(
    agentId: string,
    payload: Omit<AgentExecutedPayload, 'agentId'>,
    options?: PublishOptions,
  ): Promise<void> {
    await this.bus.publish<AgentExecutedPayload>(
      AGENT_EVENT_TYPES.EXECUTED,
      { agentId, ...payload },
      { partitionKey: agentId, ...options },
    );
  }
}
