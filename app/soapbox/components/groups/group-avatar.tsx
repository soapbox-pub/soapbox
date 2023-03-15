import clsx from 'clsx';
import React from 'react';

import { useGroupRoles } from 'soapbox/hooks/useGroupRoles';

import { Avatar } from '../ui';

import type { Group } from 'soapbox/schemas';

interface IGroupAvatar {
  group: Group
  size: number
  withRing?: boolean
}

const GroupAvatar = (props: IGroupAvatar) => {
  const { group, size, withRing = false } = props;

  const { normalizeRole } = useGroupRoles();

  const isAdmin = normalizeRole(group.relationship?.role as any) === 'admin';

  return (
    <Avatar
      className={
        clsx('relative rounded-full', {
          'shadow-[0_0_0_2px_theme(colors.primary.600),0_0_0_4px_theme(colors.white)]': isAdmin && withRing,
          'shadow-[0_0_0_2px_theme(colors.primary.600)]': isAdmin && !withRing,
          'shadow-[0_0_0_2px_theme(colors.white)]': !isAdmin && withRing,
        })
      }
      src={group.avatar}
      size={size}
    />
  );
};

export default GroupAvatar;