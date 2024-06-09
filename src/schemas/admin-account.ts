import { z } from 'zod';

import { accountSchema } from './account';

const adminAccountSchema = z.object({
  id: z.string(),
  account: accountSchema,
  username: z.string(),
  domain: z.string(),
  created_at: z.string().datetime(),
  email: z.string().email().nullish().catch(null),
  ip: z.string().ip().nullish(),
  ips: z.string().ip().array().nullish(),
  locale: z.string(),
  invite_request: z.string().nullish(),
  role: z.string().nullish(),
  confirmed: z.boolean().catch(true),
  approved: z.boolean().catch(true),
  disabled: z.boolean().catch(false),
  silenced: z.boolean().catch(false),
  suspended: z.boolean().catch(false),
  sensitized: z.boolean().catch(false),
});

type AdminAccount = z.infer<typeof adminAccountSchema>;

export { adminAccountSchema, AdminAccount };