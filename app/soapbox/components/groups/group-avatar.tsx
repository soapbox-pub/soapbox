import clsx from 'clsx';
import React from 'react';

import { GroupRoles } from 'soapbox/schemas/group-member';

import { Avatar } from '../ui';

import type { Group } from 'soapbox/schemas';

interface IGroupAvatar {
  group: Group
  size: number
  withRing?: boolean
}

const GroupAvatar = (props: IGroupAvatar) => {
  const { group, size, withRing = false } = props;

  const isOwner = group.relationship?.role === GroupRoles.OWNER;

  return (
    <Avatar
      className={
        clsx('relative rounded-full', {
          'shadow-[0_0_0_2px_theme(colors.primary.600),0_0_0_4px_theme(colors.white)]': isOwner && withRing,
          'dark:shadow-[0_0_0_2px_theme(colors.primary.600),0_0_0_4px_theme(colors.gray.800)]': isOwner && withRing,
          'shadow-[0_0_0_2px_theme(colors.primary.600)]': isOwner && !withRing,
          'shadow-[0_0_0_2px_theme(colors.white)] dark:shadow-[0_0_0_2px_theme(colors.gray.800)]': !isOwner && withRing,
        })
      }
      src={group.avatar}
      size={size}
    />
  );
};

export default GroupAvatar;