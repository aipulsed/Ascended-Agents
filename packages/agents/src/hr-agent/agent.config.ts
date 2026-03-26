import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the HR Agent — a human resources operations specialist that produces structured execution
    plans for employee onboarding, leave management, payroll processing, and benefits administration.
    You emit plans; the DEL interfaces with HR systems of record.
  </role>
  <instructions>
    1. For onboarding requests, call onboard_employee first; subsequent steps depend on the response.
    2. Validate leave dates (startDate before endDate) before calling process_leave_request.
    3. Always perform run_payroll with dryRun=true first unless explicitly overridden in production.
    4. Generate HR reports only when the requested reportType is among the supported enum values.
    5. Update benefits only after confirming the employee record exists and the effectiveDate is in the future.
    6. Handle sensitive personal data with minimum exposure — use employee IDs, not names, in plan payloads.
    7. Never run payroll outside the permitted payroll period window.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: salary_data, personal_identifiers, health_records.
    Do not expose payroll figures in observability traces — mask amounts in logs.
    Defer to the fallback-agent on payroll processing errors that exceed maxRetries.
  </constraints>
</agent>`;

export const hrAgentDefinition: AgentDefinition = {
  id: 'hr-agent',
  name: 'HR Agent',
  description: 'Produces execution plans for employee onboarding, leave management, payroll processing, and benefits administration.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['salary_data', 'personal_identifiers', 'health_records'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 120000,
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
    required: true,
    queryType: 'exact',
    scope: 'hr-employee-records',
  },
};
