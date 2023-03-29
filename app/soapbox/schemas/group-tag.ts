import z from 'zod';

const groupTagSchema = z.object({
  id: z.string(),
  uses: z.number(),
  name: z.string(),
  url: z.string(),
  pinned: z.boolean().catch(false),
  visible: z.boolean().default(true),
});

type GroupTag = z.infer<typeof groupTagSchema>;

export { groupTagSchema, type GroupTag };
