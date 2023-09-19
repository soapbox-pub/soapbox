import { z } from 'zod';

const mentionSchema = z.object({
  acct: z.string(),
  id: z.string(),
  url: z.string().url().catch(''),
  username: z.string().catch(''),
}).transform((mention) => {
  if (!mention.username) {
    mention.username = mention.acct.split('@')[0];
  }

  return mention;
});

type Mention = z.infer<typeof mentionSchema>;

export { mentionSchema, type Mention };