import { z } from 'zod';

export const createOrderSchema = z.object({}).strict();

export const orderIdSchema = z.object({
  id: z.string().uuid('Invalid order id'),
});