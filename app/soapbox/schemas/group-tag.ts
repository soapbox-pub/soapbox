import z from 'zod';

const groupTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  groups: z.number().optional(),
  url: z.string().optional(),
  uses: z.number().optional(),
  pinned: z.boolean().optional().catch(false),
  visible: z.boolean().optional().default(true),
});

type GroupTag = z.infer<typeof groupTagSchema>;

export { groupTagSchema, type GroupTag };
