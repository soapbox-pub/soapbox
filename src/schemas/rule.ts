import { z } from 'zod';

import { coerceObject } from './utils';

const ruleSchema = z.preprocess((data: any) => {
  return {
    ...data,
    hint: data.hint || data.subtext,
  };
}, coerceObject({
  id: z.string(),
  text: z.string().catch(''),
  hint: z.string().catch(''),
  rule_type: z.enum(['account', 'content', 'group']).nullable().catch(null),
}));

type Rule = z.infer<typeof ruleSchema>;

export { ruleSchema, type Rule };