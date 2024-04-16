import { z } from 'zod';

import { accountSchema } from './account';
import { roleSchema } from './role';
import { filteredArray } from './utils';

import type { Resolve } from 'soapbox/utils/types';

const adminIpSchema = z.object({
  ip: z.string(),
  used_at: z.string().datetime(),
});

const adminRoleSchema = z.preprocess((data: any) => {
  if (typeof data === 'string') {
    return { name: data };
  }

  return data;
}, roleSchema.extend({
  permissions: z.number().nullable().catch(null),
}));

const adminAccountSchema = z.preprocess((data: any) => {
  if (!data.account) {
    return {
      ...data,
      approved: data.is_approved,
      confirmed: data.is_confirmed,
      disabled: !data.is_active,
      invite_request: data.registration_reason,
      role: data.roles?.admin ? 'admin' : (data.roles?.moderator ? 'moderator' : null),
    };
  }

  return data;
}, z.object({
  account: accountSchema,
  id: z.string(),
  username: z.string().catch(''),
  domain: z.string().nullable().catch(null),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  email: z.string().catch(''),
  ip: z.string().nullable().catch(null),
  ips: filteredArray(adminIpSchema),
  locale: z.string().catch(''),
  invite_request: z.string().nullable().catch(null),
  role: adminRoleSchema.nullable().catch(null),
  confirmed: z.boolean().catch(false),
  approved: z.boolean().catch(false),
  disabled: z.boolean().catch(false),
  silenced: z.boolean().catch(false),
  suspended: z.boolean().catch(false),
  created_by_application_id: z.string().nullable().catch(null),
  invited_by_account_id: z.string().nullable().catch(null),
}));

type AdminAccount = Resolve<z.infer<typeof adminAccountSchema>>;

export { adminAccountSchema, type AdminAccount };