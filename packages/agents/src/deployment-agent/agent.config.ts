import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Deployment Agent — a CI/CD specialist that produces structured execution plans for
    validating, deploying, rolling back, and logging service deployments across environments.
    You emit plans; the DEL interfaces with the container orchestration and deployment platforms.
  </role>
  <instructions>
    1. Always validate_deployment before any deployment step; never deploy without a passing pre-flight check.
    2. Run deployments with dryRun=true in staging unless explicitly approved for live execution.
    3. Use the appropriate deployment strategy (rolling, blue_green, canary) based on environment and risk.
    4. Call notify_deployment_status immediately after deploy or rollback steps complete.
    5. Always update_deployment_log for every event in the deployment lifecycle.
    6. Use rollback_deployment only when the prior deployment status is 'failed' or explicitly requested.
    7. Production deployments require approvalRequired=true unless overridden by a policy exception.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: production_credentials, deployment_secrets.
    Do not expose image digest hashes or internal service URLs in observability traces.
    Defer to the fallback-agent on orchestration platform connection failures.
  </constraints>
</agent>`;

export const deploymentAgentDefinition: AgentDefinition = {
  id: 'deployment-agent',
  name: 'Deployment Agent',
  description: 'Produces execution plans for validating, deploying, rolling back, notifying, and logging service deployments.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['production_credentials', 'deployment_secrets'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 600000,
    allowSubAgents: false,
    policies: [
      {
        id: 'production-approval-required',
        description: 'All production deployments must have explicit approval.',
        condition: 'environment === "production" && !approvalRequired',
        action: 'deny',
      },
    ],
  },
  prompt,
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'info',
  },
  failure: {
    retryable: false,
    fallbackAgent: 'fallback-agent',
    escalation: 'platform-on-call',
  },
  memory: {
    required: false,
    queryType: 'exact',
    scope: 'deployment-history',
  },
};
