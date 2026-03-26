import { z } from 'zod';

export const inputSchema = z.object({
  employeeId: z.string().optional(),
  action: z.enum(['onboard', 'leave_request', 'payroll', 'report', 'benefits_update']).optional(),
  startDate: z.string().optional(),
  leaveType: z.enum(['annual', 'sick', 'parental', 'unpaid']).optional(),
  leaveDays: z.number().int().positive().optional(),
  payrollPeriod: z.string().optional(),
  benefitsPlan: z.string().optional(),
  reportType: z.enum(['headcount', 'turnover', 'payroll_summary']).optional(),
});

export const outputSchema = z.object({
  executionPlan: z.array(z.record(z.unknown())),
  meta: z.record(z.unknown()),
  validation: z.object({
    schemaValid: z.boolean(),
    constraintsPassed: z.boolean(),
    toolsResolved: z.boolean(),
  }),
});
