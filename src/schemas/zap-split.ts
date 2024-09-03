import { z } from 'zod';

import { accountSchema } from './account';

const zapSplitSchema = z.object({
  account: accountSchema,
  message: z.string().catch(''),
  weight: z.number().catch(0),
});

type ZapSplitData = z.infer<typeof zapSplitSchema>;

export { zapSplitSchema, type ZapSplitData };