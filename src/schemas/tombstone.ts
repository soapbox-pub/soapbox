import { z } from 'zod';

const tombstoneSchema = z.object({
  reason: z.enum(['deleted']),
});

type Tombstone = z.infer<typeof tombstoneSchema>;

export { tombstoneSchema, type Tombstone };