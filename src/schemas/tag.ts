import { z } from 'zod';

import { httpUrlSchema } from './utils.ts';

const historySchema = z.object({
  accounts: z.coerce.number(),
  uses: z.coerce.number(),
});

/** https://docs.joinmastodon.org/entities/tag */
const tagSchema = z.object({
  name: z.string().min(1),
  url: httpUrlSchema.catch(''),
  history: z.array(historySchema).nullable().catch(null),
  following: z.boolean().catch(false),
});

type Tag = z.infer<typeof tagSchema>;

export { tagSchema, type Tag };