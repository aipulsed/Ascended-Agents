import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'extract_text',
    description: 'Extract raw text content from a document file (PDF, DOCX, image, etc.).',
    inputSchema: z.object({
      documentUrl: z.string().url(),
      documentType: z.enum(['pdf', 'docx', 'txt', 'html', 'image']),
      language: z.string().optional(),
    }),
    outputSchema: z.object({
      text: z.string(),
      pageCount: z.number().optional(),
      extractedAt: z.string(),
      confidence: z.number().min(0).max(1).optional(),
    }),
    version: '1.0.0',
    tags: ['document', 'extraction'],
  },
  {
    name: 'classify_document',
    description: 'Classify a document into a predefined category using ML-based classification.',
    inputSchema: z.object({
      documentId: z.string(),
      text: z.string(),
      categories: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      documentId: z.string(),
      category: z.string(),
      confidence: z.number().min(0).max(1),
      alternativeCategories: z.array(z.object({ category: z.string(), confidence: z.number() })).optional(),
    }),
    version: '1.0.0',
    tags: ['document', 'classification'],
  },
  {
    name: 'validate_document',
    description: 'Validate a document against a set of business rules or compliance requirements.',
    inputSchema: z.object({
      documentId: z.string(),
      validationRules: z.array(z.string()),
      strictMode: z.boolean().optional(),
    }),
    outputSchema: z.object({
      valid: z.boolean(),
      violations: z.array(z.object({ rule: z.string(), message: z.string() })),
      validatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['document', 'validation', 'compliance'],
  },
  {
    name: 'archive_document',
    description: 'Move a processed document to long-term archive storage with metadata tagging.',
    inputSchema: z.object({
      documentId: z.string(),
      destination: z.string(),
      retentionDays: z.number().int().positive().optional(),
      tags: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      archiveId: z.string(),
      location: z.string(),
      archivedAt: z.string(),
      expiresAt: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['document', 'archive', 'storage'],
  },
  {
    name: 'generate_document_summary',
    description: "Produce a concise summary of a document's key points and entities.",
    inputSchema: z.object({
      documentId: z.string(),
      text: z.string(),
      maxWords: z.number().int().positive().optional(),
      extractEntities: z.boolean().optional(),
    }),
    outputSchema: z.object({
      summary: z.string(),
      entities: z.array(z.object({ type: z.string(), value: z.string() })).optional(),
      wordCount: z.number(),
      generatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['document', 'nlp', 'summarization'],
  },
];
