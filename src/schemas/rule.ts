import { z } from 'zod';

import { coerceObject } from './utils';

const ruleSchema = coerceObject({
  id: z.string(),
  text: z.string().catch(''),
});

type Rule = z.infer<typeof ruleSchema>;

export { ruleSchema, type Rule };