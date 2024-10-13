import { z } from 'zod';

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  created_at: z.number(),
});

type Token = z.infer<typeof tokenSchema>;

export { tokenSchema, Token };