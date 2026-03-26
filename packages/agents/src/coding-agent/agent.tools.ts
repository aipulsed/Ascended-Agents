import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'lint_code',
    description: 'Run a linter against the target source files and return a list of violations.',
    inputSchema: z.object({
      files: z.array(z.string()),
      config: z.record(z.unknown()).optional(),
      fix: z.boolean().optional(),
    }),
    outputSchema: z.object({
      violations: z.array(z.object({
        file: z.string(),
        line: z.number(),
        rule: z.string(),
        message: z.string(),
        severity: z.enum(['error', 'warning', 'info']),
      })),
      totalViolations: z.number(),
      passed: z.boolean(),
    }),
    version: '1.0.0',
    tags: ['code-quality', 'static-analysis'],
  },
  {
    name: 'run_unit_tests',
    description: 'Execute the project unit test suite and return pass/fail results with coverage.',
    inputSchema: z.object({
      projectPath: z.string(),
      testCommand: z.string().optional(),
      coverageThreshold: z.number().min(0).max(100).optional(),
    }),
    outputSchema: z.object({
      passed: z.boolean(),
      total: z.number(),
      passing: z.number(),
      failing: z.number(),
      coverage: z.number(),
      failedTests: z.array(z.string()),
    }),
    version: '1.0.0',
    tags: ['testing', 'coverage'],
  },
  {
    name: 'build_project',
    description: 'Compile and bundle the project using the configured build tool.',
    inputSchema: z.object({
      projectPath: z.string(),
      buildCommand: z.string().optional(),
      outputDir: z.string().optional(),
      environment: z.enum(['dev', 'staging', 'production']).optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      outputPath: z.string(),
      buildTimeMs: z.number(),
      artifacts: z.array(z.string()),
      errors: z.array(z.string()),
    }),
    version: '1.0.0',
    tags: ['build', 'ci'],
  },
  {
    name: 'generate_docs',
    description: 'Auto-generate API and code documentation from source annotations.',
    inputSchema: z.object({
      sourceDir: z.string(),
      outputDir: z.string(),
      format: z.enum(['html', 'markdown', 'json']).optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      docsPath: z.string(),
      filesProcessed: z.number(),
      warnings: z.array(z.string()),
    }),
    version: '1.0.0',
    tags: ['documentation', 'code-quality'],
  },
  {
    name: 'scan_security',
    description: 'Perform a static security analysis on the codebase to detect common vulnerabilities.',
    inputSchema: z.object({
      targetPath: z.string(),
      level: z.enum(['low', 'medium', 'high']).optional(),
      excludePaths: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      vulnerabilities: z.array(z.object({
        id: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        file: z.string(),
        line: z.number().optional(),
      })),
      passed: z.boolean(),
      scanDurationMs: z.number(),
    }),
    version: '1.0.0',
    tags: ['security', 'static-analysis'],
  },
];
