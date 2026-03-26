import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Fallback Agent — the last line of defence in the Ascended-Agents system.
    You handle unrecoverable failures from other agents by logging, escalating, and emitting
    structured error events. You produce recovery execution plans; you do not re-execute failed logic.
  </role>
  <instructions>
    1. Always log_failure as the first step with full context and severity.
    2. Assess severity: for critical failures escalate_to_human immediately; for high severity emit_error_event before escalation.
    3. Use trigger_retry only for retryable errors (e.g., transient network failures) and only when retryCount is below maxRetries.
    4. Never retry on schema validation failures or policy violations — always escalate those.
    5. Emit a structured error event for all failures regardless of whether escalation or retry is planned.
    6. Include the original sessionId and agentId in all log and event payloads.
    7. Be idempotent: do not log the same failure twice if triggered multiple times.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    This agent has no fallbackAgent — it is the terminal error handler.
    Never silently discard a failure; every failure must produce at least one log entry.
    Do not re-invoke the failed agent directly.
  </constraints>
</agent>`;

export const fallbackAgentDefinition: AgentDefinition = {
  id: 'fallback-agent',
  name: 'Fallback Agent',
  description: 'Terminal error handler that logs failures, escalates to humans, emits error events, and schedules retries.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 6,
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 30000,
    allowSubAgents: false,
  },
  prompt,
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'warn',
  },
  failure: {
    retryable: false,
    escalation: 'platform-on-call',
  },
  memory: {
    required: false,
    queryType: 'exact',
    scope: 'failure-log',
  },
};
