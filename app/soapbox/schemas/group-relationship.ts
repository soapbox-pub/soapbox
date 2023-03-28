import z from 'zod';

import { GroupRoles } from './group-member';

const groupRelationshipSchema = z.object({
  id: z.string(),
  member: z.boolean().catch(false),
  requested: z.boolean().catch(false),
  role: z.nativeEnum(GroupRoles).catch(GroupRoles.USER),
  blocked_by: z.boolean().catch(false),
  notifying: z.boolean().nullable().catch(null),
});

type GroupRelationship = z.infer<typeof groupRelationshipSchema>;

export { groupRelationshipSchema, GroupRelationship };