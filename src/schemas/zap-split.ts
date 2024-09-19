import { z } from 'zod';

import { type Account, accountSchema } from './account';

const addMethodsToAccount = (account: Account) => {
  return {
    ...account,
    get: (key: string) => (account as any)[key],
    getIn: (path: string[]) => path.reduce((acc, key) => (acc as any)[key], account),
    toJS: () => account,  
  };
};

const baseZapAccountSchema = z.object({
  account: accountSchema.transform(addMethodsToAccount),
  message: z.string().catch(''),
  weight: z.number().catch(0),
});

type ZapSplitData = z.infer<typeof baseZapAccountSchema>;

export { baseZapAccountSchema, type ZapSplitData };