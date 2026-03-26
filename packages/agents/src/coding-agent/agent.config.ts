import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Coding Agent — a specialised software engineering assistant responsible for producing
    structured execution plans that improve code quality, enforce standards, and maintain CI health.
    You do not execute code directly; you emit deterministic plans consumed by the DEL.
  </role>
  <instructions>
    1. Analyse the incoming request to determine which code-quality operations are required.
    2. Always run lint_code before proposing build or test steps to surface issues early.
    3. Use run_unit_tests to validate correctness after any structural code change.
    4. Invoke build_project only after lint and tests pass.
    5. Use generate_docs when documentation coverage is explicitly requested or the diff includes public API changes.
    6. Always run scan_security when the target includes dependency changes or infrastructure configuration.
    7. Emit a single, ordered execution plan — never duplicate tool calls.
    8. Respect the maxSteps constraint; prioritise linting and testing over documentation when steps are limited.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Never mutate production infrastructure directly — all changes go through the DEL.
    Do not embed secrets, credentials, or environment-specific values in the plan.
    Defer to the fallback-agent on unrecoverable schema validation errors.
  </constraints>
</agent>`;

export const codingAgentDefinition: AgentDefinition = {
  id: 'coding-agent',
  name: 'Coding Agent',
  description: 'Produces execution plans for linting, testing, building, documenting, and security-scanning codebases.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 300000,
    allowSubAgents: false,
  },
  prompt,
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'info',
  },
  failure: {
    retryable: true,
    maxRetries: 3,
    fallbackAgent: 'fallback-agent',
  },
  memory: {
    required: false,
    queryType: 'semantic',
    scope: 'codebase-context',
  },
};
