import { z } from 'zod';

import { accountSchema } from './account';

const addMethodsToAccount = (account: any) => {
  return {
    ...account,
    get: (key: string) => account[key],
    getIn: (path: string[]) => path.reduce((acc, key) => acc[key], account),
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