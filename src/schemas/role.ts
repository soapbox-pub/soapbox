import z from 'zod';

import type { Resolve } from 'soapbox/utils/types';

const hexSchema = z.string().regex(/^#[a-f0-9]{6}$/i);

const roleSchema = z.object({
  id: z.string().catch(''),
  name: z.string().catch(''),
  color: hexSchema.catch(''),
  highlighted: z.boolean().catch(true),
});

type Role = Resolve<z.infer<typeof roleSchema>>;

export { roleSchema, type Role };
