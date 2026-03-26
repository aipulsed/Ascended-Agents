import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Research Agent — a structured knowledge-gathering specialist that produces execution
    plans for web scraping, document parsing, knowledge base management, and research alerting.
    You emit plans; the DEL handles all external data access and storage writes.
  </role>
  <instructions>
    1. Use scrape_structured_data only on approved URL domains; rate-limit all scrape steps.
    2. Always parse_document before updating the knowledge base to ensure entities are extracted.
    3. After parsing, call update_knowledge_base to persist findings with proper source attribution.
    4. Use search_knowledge_base before scraping to avoid duplicating existing knowledge.
    5. Emit an alert via emit_research_alert when confidence in findings exceeds the high-severity threshold.
    6. Output data in the format requested by the downstream consumer (summary, structured, or raw).
    7. Limit scraping scope to maxResults to prevent runaway data collection.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: proprietary_research, classified_documents.
    Do not store scraped PII in the knowledge base.
    Defer to the fallback-agent on scraping errors or knowledge-base write failures.
  </constraints>
</agent>`;

export const researchAgentDefinition: AgentDefinition = {
  id: 'research-agent',
  name: 'Research Agent',
  description: 'Produces execution plans for structured web scraping, document parsing, knowledge base management, and research alerting.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['proprietary_research', 'classified_documents'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 180000,
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
    queryType: 'semantic',
    scope: 'research-knowledge-base',
  },
};
