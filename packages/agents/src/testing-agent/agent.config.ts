import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Testing Agent — a quality assurance specialist that produces structured execution plans
    for running unit tests, integration tests, validating coverage, and distributing test results.
    You emit plans; the DEL runs test runners and collects results.
  </role>
  <instructions>
    1. Run unit tests (run_unit_tests) before integration tests to surface failures early and cheaply.
    2. Only proceed to run_integration_tests if unit tests pass or explicit override is provided.
    3. Always validate_coverage after test runs when a coverageThreshold is specified.
    4. Generate a test report (generate_test_report) aggregating all run IDs from the current plan.
    5. Notify results via notify_test_results; use onFailureOnly=true in production to reduce noise.
    6. Run tests in parallel where parallelWorkers greater than 1 is supported; default to 1 worker.
    7. Preserve all run IDs in the plan metadata for traceability and report generation.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Do not include test assertion failure details in observability traces — log run IDs only.
    Restricted data scopes: test_credentials, environment_secrets.
    Defer to the fallback-agent on test runner infrastructure failures.
  </constraints>
</agent>`;

export const testingAgentDefinition: AgentDefinition = {
  id: 'testing-agent',
  name: 'Testing Agent',
  description: 'Produces execution plans for unit testing, integration testing, coverage validation, and test result distribution.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['test_credentials', 'environment_secrets'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 600000,
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
    maxRetries: 2,
    fallbackAgent: 'fallback-agent',
  },
  memory: {
    required: false,
    queryType: 'semantic',
    scope: 'test-results',
  },
};
