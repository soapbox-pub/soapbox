import { z } from 'zod';

import { httpUrlSchema } from './utils.ts';

const mentionSchema = z.object({
  acct: z.string(),
  id: z.string(),
  url: httpUrlSchema.catch(''),
  username: z.string().catch(''),
}).transform((mention) => {
  if (!mention.username) {
    mention.username = mention.acct.split('@')[0];
  }

  return mention;
});

type Mention = z.infer<typeof mentionSchema>;

export { mentionSchema, type Mention };