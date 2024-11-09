import { z } from 'zod';

import { accountSchema } from './account';

const adminIpSchema = z.object({
  ip: z.string().ip(),
  used_at: z.string().datetime(),
});

const adminAccountSchema = z.object({
  id: z.string(),
  account: accountSchema,
  username: z.string(),
  domain: z.string().nullish().catch(null),
  created_at: z.string().datetime(),
  email: z.string().email().nullish().catch(null),
  ip: z.string().ip().nullish().catch(null),
  ips: adminIpSchema.array().nullish().catch(null),
  locale: z.string().nullish().catch(null),
  invite_request: z.string().nullish().catch(null),
  role: z.string().nullish().catch(null),
  confirmed: z.boolean().catch(true),
  approved: z.boolean().catch(true),
  disabled: z.boolean().catch(false),
  silenced: z.boolean().catch(false),
  suspended: z.boolean().catch(false),
  sensitized: z.boolean().catch(false),
});

type AdminAccount = z.infer<typeof adminAccountSchema>;

export { adminAccountSchema, type AdminAccount };