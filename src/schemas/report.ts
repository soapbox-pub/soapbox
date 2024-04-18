import { z } from 'zod';

import { adminAccountSchema } from './admin-account';
import { ruleSchema } from './rule';
import { statusSchema } from './status';
import { filteredArray } from './utils';

import type { Resolve } from 'soapbox/utils/types';

const reportSchema = z.preprocess((data: any) => {
  if (data.actor) {
    return {
      ...data,
      target_account: data.account,
      account: data.actor,
      action_taken: data.state !== 'open',
      comment: data.content,
      updated_at: data.created_at,
    };
  }

  return data;
}, z.object({
  account: adminAccountSchema,
  action_taken: z.boolean().catch(false),
  action_taken_at: z.string().datetime().nullable().catch(null),
  action_taken_by_account: adminAccountSchema.nullable().catch(null),
  assigned_account: adminAccountSchema.nullable().catch(null),
  category: z.enum(['spam', 'violation', 'other']).catch('other'),
  comment: z.string().catch(''),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  forwarded: z.boolean().catch(false),
  id: z.string(),
  rules: filteredArray(ruleSchema),
  statuses: filteredArray(statusSchema),
  target_account: adminAccountSchema,
  updated_at: z.string().datetime().catch(new Date().toUTCString()),
}));

type Report = Resolve<z.infer<typeof reportSchema>>;

export { reportSchema, type Report };