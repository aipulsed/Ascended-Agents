import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'onboard_employee',
    description: 'Initiate the employee onboarding workflow including account setup and welcome communications.',
    inputSchema: z.object({
      employeeId: z.string(),
      fullName: z.string(),
      email: z.string().email(),
      role: z.string(),
      department: z.string(),
      startDate: z.string(),
      managerId: z.string().optional(),
    }),
    outputSchema: z.object({
      onboardingId: z.string(),
      status: z.enum(['initiated', 'in_progress', 'completed']),
      tasksCreated: z.number(),
      startedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['hr', 'onboarding'],
  },
  {
    name: 'process_leave_request',
    description: 'Submit and route an employee leave request through the approval workflow.',
    inputSchema: z.object({
      employeeId: z.string(),
      leaveType: z.enum(['annual', 'sick', 'parental', 'unpaid']),
      startDate: z.string(),
      endDate: z.string(),
      reason: z.string().optional(),
    }),
    outputSchema: z.object({
      requestId: z.string(),
      status: z.enum(['pending', 'approved', 'rejected']),
      approver: z.string().optional(),
      submittedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['hr', 'leave'],
  },
  {
    name: 'run_payroll',
    description: 'Execute payroll processing for a specified pay period and employee group.',
    inputSchema: z.object({
      payrollPeriod: z.string(),
      employeeIds: z.array(z.string()).optional(),
      currency: z.string().length(3).optional(),
      dryRun: z.boolean().optional(),
    }),
    outputSchema: z.object({
      payrollRunId: z.string(),
      employeesProcessed: z.number(),
      totalGross: z.number(),
      totalNet: z.number(),
      status: z.enum(['processing', 'completed', 'failed']),
      processedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['hr', 'payroll'],
  },
  {
    name: 'generate_hr_report',
    description: 'Produce an HR analytics report covering headcount, turnover, or payroll summaries.',
    inputSchema: z.object({
      reportType: z.enum(['headcount', 'turnover', 'payroll_summary']),
      dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
      format: z.enum(['pdf', 'csv', 'json']).optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      reportUrl: z.string().optional(),
      generatedAt: z.string(),
      summary: z.record(z.unknown()),
    }),
    version: '1.0.0',
    tags: ['hr', 'reporting'],
  },
  {
    name: 'update_benefits',
    description: 'Update employee benefits enrolment in the HR benefits management system.',
    inputSchema: z.object({
      employeeId: z.string(),
      benefitsPlan: z.string(),
      effectiveDate: z.string(),
      changes: z.record(z.unknown()),
    }),
    outputSchema: z.object({
      enrolmentId: z.string(),
      updated: z.boolean(),
      updatedAt: z.string(),
      newPlan: z.string(),
    }),
    version: '1.0.0',
    tags: ['hr', 'benefits'],
  },
];
