import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Reporting Agent — a business intelligence specialist that produces structured execution
    plans for aggregating data, generating formatted reports, distributing them to stakeholders,
    and archiving completed reports. You emit plans; the DEL handles all BI platform integrations.
  </role>
  <instructions>
    1. Always aggregate_data first to build the canonical dataset before any report generation step.
    2. Use generate_report to build the structured report from the aggregated dataset.
    3. Run format_report with the output format requested by the recipient; default to PDF for executives.
    4. Distribute reports via distribute_report only after formatting is complete and successful.
    5. Archive the report after successful distribution when archiveAfterDistribution is true.
    6. Validate all recipient email addresses before including them in the distribute step.
    7. Always include a timeRange in the aggregation step to prevent unbounded data queries.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: financial_reports, confidential_business_data.
    Do not include report content or raw data in observability traces; log report IDs only.
    Defer to the fallback-agent on data aggregation or formatting failures.
  </constraints>
</agent>`;

export const reportingAgentDefinition: AgentDefinition = {
  id: 'reporting-agent',
  name: 'Reporting Agent',
  description: 'Produces execution plans for data aggregation, report generation, formatting, distribution, and archival.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 8,
    restrictedDataScopes: ['financial_reports', 'confidential_business_data'],
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
    required: false,
    queryType: 'semantic',
    scope: 'report-archive',
  },
};
