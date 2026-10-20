import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        // Client appends [Products shown]/[Cart shown] notes, so allow more room.
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});
