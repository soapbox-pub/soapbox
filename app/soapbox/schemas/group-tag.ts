import z from 'zod';

const groupTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  uses: z.number().optional(),
  url: z.string().optional(),
  pinned: z.boolean().optional().catch(false),
  visible: z.boolean().optional().default(true),
});

type GroupTag = z.infer<typeof groupTagSchema>;

export { groupTagSchema, type GroupTag };
