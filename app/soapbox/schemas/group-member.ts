import z from 'zod';

import { accountSchema } from './account';

enum TruthSocialGroupRoles {
  ADMIN = 'owner',
  MODERATOR = 'admin',
  USER = 'user'
}

enum BaseGroupRoles {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

const groupMemberSchema = z.object({
  id: z.string(),
  account: accountSchema,
  role: z.union([
    z.nativeEnum(TruthSocialGroupRoles),
    z.nativeEnum(BaseGroupRoles),
  ]),
});

type GroupMember = z.infer<typeof groupMemberSchema>;

export { groupMemberSchema, GroupMember };