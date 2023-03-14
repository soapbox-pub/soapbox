import { TRUTHSOCIAL } from 'soapbox/utils/features';

import { useBackend } from './useBackend';

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

const roleMap = {
  [TruthSocialGroupRoles.ADMIN]: BaseGroupRoles.ADMIN,
  [TruthSocialGroupRoles.MODERATOR]: BaseGroupRoles.MODERATOR,
  [TruthSocialGroupRoles.USER]: BaseGroupRoles.USER,
};

/**
 * Returns the correct role name depending on the used backend.
 *
 * @returns Object
 */
const useGroupRoles = () => {
  const version = useBackend();
  const isTruthSocial = version.software === TRUTHSOCIAL;
  const selectedRoles = isTruthSocial ? TruthSocialGroupRoles : BaseGroupRoles;

  const normalizeRole = (role: TruthSocialGroupRoles) => {
    if (isTruthSocial) {
      return roleMap[role];
    }

    return role;
  };

  return {
    normalizeRole,
    roles: {
      admin: selectedRoles.ADMIN,
      moderator: selectedRoles.MODERATOR,
      user: selectedRoles.USER,
    },
  };
};

export { useGroupRoles, TruthSocialGroupRoles, BaseGroupRoles };