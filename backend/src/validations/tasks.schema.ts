import { z } from 'zod';

import { TASK_STATUSES } from '../domain/Task.js';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(TASK_STATUSES).optional(),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  q: z.string().max(2000).optional(),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (Number.isInteger(value) && value > 0 && value <= 100), {
      message: 'limit must be between 1 and 100',
    }),
  offset: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (Number.isInteger(value) && value >= 0), {
      message: 'offset must be a positive integer',
    }),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});
