import React from 'react';
import { FormattedMessage } from 'react-intl';

import { HStack, Icon, Text } from 'soapbox/components/ui';
import { Group } from 'soapbox/types/entities';

interface IGroupRelationship {
  group: Group
}

const GroupRelationship = ({ group }: IGroupRelationship) => {
  const isAdmin = group.relationship?.role === 'admin';
  const isModerator = group.relationship?.role === 'moderator';

  if (!isAdmin || !isModerator) {
    return null;
  }

  return (
    <HStack space={1} alignItems='center'>
      <Icon
        className='h-4 w-4'
        src={
          isAdmin
            ? require('@tabler/icons/users.svg')
            : require('@tabler/icons/gavel.svg')
        }
      />

      <Text tag='span' weight='medium' size='sm' theme='inherit'>
        {isAdmin
          ? <FormattedMessage id='group.role.admin' defaultMessage='Admin' />
          : <FormattedMessage id='group.role.moderator' defaultMessage='Moderator' />}
      </Text>
    </HStack>
  );
};

export default GroupRelationship;