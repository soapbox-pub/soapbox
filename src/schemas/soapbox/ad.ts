import { z } from 'zod';

import { cardSchema } from '../card';

const adSchema = z.object({
  card: cardSchema,
  impression: z.string().optional().catch(undefined),
  expires_at: z.string().datetime().optional().catch(undefined),
  reason: z.string().optional().catch(undefined),
});

type Ad = z.infer<typeof adSchema>;

export { adSchema, type Ad };