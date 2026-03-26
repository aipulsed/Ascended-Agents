import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'scan_vulnerabilities',
    description: 'Perform a vulnerability scan on a target system or codebase.',
    inputSchema: z.object({
      targetPath: z.string(),
      scanType: z.enum(['static', 'dynamic', 'full']).optional(),
      severityThreshold: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      excludePatterns: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      vulnerabilities: z.array(z.object({
        cveId: z.string().optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        affected: z.string(),
        remediation: z.string().optional(),
      })),
      passed: z.boolean(),
      scanDurationMs: z.number(),
      scannedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['security', 'vulnerability', 'scanning'],
  },
  {
    name: 'check_dependencies',
    description: 'Audit third-party dependencies for known security advisories.',
    inputSchema: z.object({
      manifestPath: z.string(),
      ecosystem: z.enum(['npm', 'pip', 'maven', 'go', 'rubygems']),
      ignoredAdvisories: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      advisories: z.array(z.object({
        packageName: z.string(),
        currentVersion: z.string(),
        advisory: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        patchedVersion: z.string().optional(),
      })),
      totalAdvisories: z.number(),
      passed: z.boolean(),
    }),
    version: '1.0.0',
    tags: ['security', 'dependencies', 'audit'],
  },
  {
    name: 'validate_access_policy',
    description: 'Validate whether a user or service account complies with defined access policies.',
    inputSchema: z.object({
      policyId: z.string(),
      userId: z.string(),
      requestedPermissions: z.array(z.string()),
      resource: z.string().optional(),
    }),
    outputSchema: z.object({
      allowed: z.boolean(),
      deniedPermissions: z.array(z.string()),
      policyVersion: z.string(),
      evaluatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['security', 'access-control', 'policy'],
  },
  {
    name: 'emit_security_alert',
    description: 'Emit a structured security alert event to the incident management system.',
    inputSchema: z.object({
      alertType: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      affectedSystem: z.string(),
      description: z.string(),
      evidence: z.record(z.unknown()).optional(),
      notifyChannels: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      alertId: z.string(),
      incidentId: z.string().optional(),
      emitted: z.boolean(),
      emittedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['security', 'alerting', 'incident'],
  },
  {
    name: 'generate_security_report',
    description: 'Compile a comprehensive security posture report from scan and audit results.',
    inputSchema: z.object({
      scope: z.enum(['full', 'dependencies', 'runtime', 'infrastructure']),
      dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
      format: z.enum(['pdf', 'json', 'html']).optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      reportUrl: z.string().optional(),
      riskScore: z.number().min(0).max(100),
      generatedAt: z.string(),
      summary: z.record(z.unknown()),
    }),
    version: '1.0.0',
    tags: ['security', 'reporting', 'compliance'],
  },
];
