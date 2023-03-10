import z from 'zod';

const groupRelationshipSchema = z.object({
  id: z.string(),
  member: z.boolean().catch(false),
  requested: z.boolean().catch(false),
  role: z.string().nullish().catch(null),
});

type GroupRelationship = z.infer<typeof groupRelationshipSchema>;

export { groupRelationshipSchema, GroupRelationship };