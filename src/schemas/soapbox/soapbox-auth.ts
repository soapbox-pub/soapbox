import { z } from 'zod';

import { tokenSchema } from 'soapbox/schemas/token';

const authUserSchema = z.object({
  access_token: z.string(),
  id: z.string(),
  url: z.string().url(),
});

const soapboxAuthSchema = z.object({
  tokens: z.record(z.string(), tokenSchema),
  users: z.record(z.string(), authUserSchema),
  me: z.string().url().optional().catch(undefined),
});

type AuthUser = z.infer<typeof authUserSchema>;
type SoapboxAuth = z.infer<typeof soapboxAuthSchema>;

export { soapboxAuthSchema, SoapboxAuth, authUserSchema, AuthUser };