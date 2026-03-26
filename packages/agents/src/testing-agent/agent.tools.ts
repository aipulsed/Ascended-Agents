import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'run_unit_tests',
    description: 'Execute the unit test suite for a project and return detailed pass/fail results.',
    inputSchema: z.object({
      projectPath: z.string(),
      testPattern: z.string().optional(),
      parallelWorkers: z.number().int().positive().optional(),
      timeout: z.number().int().positive().optional(),
    }),
    outputSchema: z.object({
      passed: z.boolean(),
      total: z.number(),
      passing: z.number(),
      failing: z.number(),
      skipped: z.number(),
      durationMs: z.number(),
      failedTests: z.array(z.object({ name: z.string(), error: z.string() })),
    }),
    version: '1.0.0',
    tags: ['testing', 'unit-tests'],
  },
  {
    name: 'run_integration_tests',
    description: 'Execute integration tests that verify interactions between services or modules.',
    inputSchema: z.object({
      suites: z.array(z.string()),
      environment: z.enum(['dev', 'staging']).optional(),
      baseUrl: z.string().url().optional(),
      timeout: z.number().int().positive().optional(),
    }),
    outputSchema: z.object({
      passed: z.boolean(),
      total: z.number(),
      passing: z.number(),
      failing: z.number(),
      durationMs: z.number(),
      failedSuites: z.array(z.object({ suite: z.string(), error: z.string() })),
    }),
    version: '1.0.0',
    tags: ['testing', 'integration-tests'],
  },
  {
    name: 'generate_test_report',
    description: 'Compile unit and integration test results into a formatted test report.',
    inputSchema: z.object({
      runIds: z.array(z.string()),
      format: z.enum(['html', 'json', 'xml']).optional(),
      includeScreenshots: z.boolean().optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      reportUrl: z.string().optional(),
      generatedAt: z.string(),
      summary: z.record(z.unknown()),
    }),
    version: '1.0.0',
    tags: ['testing', 'reporting'],
  },
  {
    name: 'validate_coverage',
    description: 'Check that code coverage meets the defined thresholds and flag under-covered modules.',
    inputSchema: z.object({
      projectPath: z.string(),
      threshold: z.number().min(0).max(100),
      coverageType: z.enum(['lines', 'branches', 'functions', 'statements']).optional(),
    }),
    outputSchema: z.object({
      passed: z.boolean(),
      coverage: z.number(),
      threshold: z.number(),
      uncoveredFiles: z.array(z.string()),
      validatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['testing', 'coverage'],
  },
  {
    name: 'notify_test_results',
    description: 'Send test result summaries to configured notification channels.',
    inputSchema: z.object({
      runId: z.string(),
      passed: z.boolean(),
      summary: z.record(z.unknown()),
      notifyChannels: z.array(z.string()),
      onFailureOnly: z.boolean().optional(),
    }),
    outputSchema: z.object({
      notified: z.boolean(),
      channels: z.array(z.string()),
      notifiedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['testing', 'notification'],
  },
];
