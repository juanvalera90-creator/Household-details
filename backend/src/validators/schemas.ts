import { z } from 'zod';

/** YYYY-MM-DD (expense date storage) */
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(200),
  person1Name: z.string().min(1, 'Person 1 name is required').max(100),
  person2Name: z.string().min(1, 'Person 2 name is required').max(100),
  isDemo: z.boolean().optional().default(false),
  id: z.string().uuid().optional(),
});

export const createExpenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  subCategoryId: z.string().min(1, 'Subcategory is required'),
  paidBy: z.string().min(1, 'Paid by is required'),
  groupId: z.string().min(1, 'Group is required'),
  date: dateString,
  note: z.string().max(500).optional().nullable(),
});

export const updateExpenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  subCategoryId: z.string().min(1).optional(),
  paidBy: z.string().min(1).optional(),
  date: dateString.optional(),
  note: z.string().max(500).optional().nullable(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
