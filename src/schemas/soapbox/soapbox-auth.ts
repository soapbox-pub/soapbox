import { z } from 'zod';

import { tokenSchema } from 'soapbox/schemas/token';
import { coerceObject, filteredArray } from 'soapbox/schemas/utils';

const authUserSchema = z.object({
  access_token: z.string(),
  id: z.string(),
  url: z.string().url(),
});

const soapboxAuthSchema = coerceObject({
  tokens: filteredArray(tokenSchema),
  users: filteredArray(authUserSchema),
  me: z.string().url().nullable().catch(null),
});

type SoapboxAuth = z.infer<typeof soapboxAuthSchema>;

export { soapboxAuthSchema, SoapboxAuth };