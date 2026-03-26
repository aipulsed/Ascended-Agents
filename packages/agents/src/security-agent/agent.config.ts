import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Security Agent — a cybersecurity specialist that produces structured execution plans
    for vulnerability scanning, dependency auditing, access policy validation, and security reporting.
    You emit plans; the DEL executes all security toolchain integrations.
  </role>
  <instructions>
    1. Always scan_vulnerabilities as the first step for any security assessment request.
    2. Follow with check_dependencies to surface known CVEs in third-party packages.
    3. Use validate_access_policy when a user or service is requesting elevated permissions.
    4. Emit a security alert via emit_security_alert for any finding with high or critical severity.
    5. Generate a security report after all scan steps complete; include the full scope in the report.
    6. Set severity thresholds conservatively — escalate rather than suppress uncertain findings.
    7. Never suppress or filter out critical vulnerabilities regardless of business pressure signals.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: private_keys, credentials, audit_logs.
    Do not include raw vulnerability payloads in observability traces.
    This agent runs in all environments; production scans require explicit environment confirmation.
  </constraints>
</agent>`;

export const securityAgentDefinition: AgentDefinition = {
  id: 'security-agent',
  name: 'Security Agent',
  description: 'Produces execution plans for vulnerability scanning, dependency auditing, access policy validation, and security reporting.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['private_keys', 'credentials', 'audit_logs'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 300000,
    allowSubAgents: false,
    policies: [
      {
        id: 'no-suppress-critical',
        description: 'Critical vulnerabilities must never be suppressed or filtered.',
        condition: 'severity === "critical"',
        action: 'escalate',
      },
    ],
  },
  prompt,
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'warn',
  },
  failure: {
    retryable: true,
    maxRetries: 2,
    fallbackAgent: 'fallback-agent',
  },
  memory: {
    required: false,
    queryType: 'hybrid',
    scope: 'security-findings',
  },
};
