import { z } from 'zod';

export const createSizeSchema = z.object({
  name: z.string().trim().min(1).max(20),
  slug: z.string().trim().min(1).max(30).regex(/^[a-z0-9-]+$/),
  display_order: z.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const updateSizeSchema = createSizeSchema.partial();

export const sizeIdSchema = z.object({ id: z.string().uuid() });

export const productSizesSchema = z.object({
  sizes: z.array(z.object({
    size_id: z.string().uuid(),
    stock: z.number().int().min(0).max(99999),
  })).max(50),
}); 