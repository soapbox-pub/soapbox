import { z } from 'zod';

const groupTagSchema = z.object({
  name: z.string(),
});

type GroupTag = z.infer<typeof groupTagSchema>;

export { groupTagSchema, type GroupTag };
