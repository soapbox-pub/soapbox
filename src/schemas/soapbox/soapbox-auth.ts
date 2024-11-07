import { z } from 'zod';

import { applicationSchema } from 'soapbox/schemas/application';
import { tokenSchema } from 'soapbox/schemas/token';

const authUserSchema = z.object({
  access_token: z.string(),
  id: z.string(),
  url: z.string().url(),
});

const authAppSchema = applicationSchema.and(
  z.object({
    access_token: z.string().optional().catch(undefined),
  }),
);

const soapboxAuthSchema = z.object({
  app: authAppSchema.optional(),
  tokens: z.record(z.string(), tokenSchema),
  users: z.record(z.string(), authUserSchema),
  me: z.string().url().optional(),
});

type AuthUser = z.infer<typeof authUserSchema>;
type SoapboxAuth = z.infer<typeof soapboxAuthSchema>;

export { soapboxAuthSchema, SoapboxAuth, authUserSchema, AuthUser };