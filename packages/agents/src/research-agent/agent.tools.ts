import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'scrape_structured_data',
    description: 'Scrape structured data from web sources and return it in a normalised schema.',
    inputSchema: z.object({
      urls: z.array(z.string().url()),
      selectors: z.record(z.string()).optional(),
      rateLimit: z.number().int().positive().optional(),
    }),
    outputSchema: z.object({
      records: z.array(z.record(z.unknown())),
      sourceUrls: z.array(z.string()),
      scrapedAt: z.string(),
      errors: z.array(z.object({ url: z.string(), error: z.string() })),
    }),
    version: '1.0.0',
    tags: ['research', 'scraping', 'data-collection'],
  },
  {
    name: 'parse_document',
    description: 'Parse a research document and extract structured knowledge entities and relationships.',
    inputSchema: z.object({
      documentPath: z.string(),
      documentType: z.enum(['pdf', 'html', 'docx', 'txt']).optional(),
      extractionSchema: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      entities: z.array(z.object({ type: z.string(), value: z.string(), confidence: z.number() })),
      relationships: z.array(z.object({ subject: z.string(), predicate: z.string(), object: z.string() })).optional(),
      rawText: z.string(),
      parsedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['research', 'nlp', 'extraction'],
  },
  {
    name: 'update_knowledge_base',
    description: 'Upsert new research findings into the shared knowledge base.',
    inputSchema: z.object({
      knowledgeBaseId: z.string(),
      entries: z.array(z.object({
        id: z.string().optional(),
        topic: z.string(),
        content: z.string(),
        source: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })),
    }),
    outputSchema: z.object({
      upserted: z.number(),
      skipped: z.number(),
      updatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['research', 'knowledge-base'],
  },
  {
    name: 'search_knowledge_base',
    description: 'Perform semantic or keyword search across the knowledge base.',
    inputSchema: z.object({
      query: z.string(),
      knowledgeBaseId: z.string().optional(),
      queryType: z.enum(['semantic', 'exact', 'hybrid']).optional(),
      limit: z.number().int().positive().optional(),
      filters: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        id: z.string(),
        topic: z.string(),
        content: z.string(),
        score: z.number(),
      })),
      totalFound: z.number(),
      searchedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['research', 'knowledge-base', 'search'],
  },
  {
    name: 'emit_research_alert',
    description: 'Emit a structured alert event when a research threshold or anomaly is detected.',
    inputSchema: z.object({
      topic: z.string(),
      alertType: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      findings: z.record(z.unknown()),
      notifyChannels: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      alertId: z.string(),
      emitted: z.boolean(),
      emittedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['research', 'alerting', 'event-bus'],
  },
];
