import React from 'react';
import { FormattedMessage } from 'react-intl';

import { HStack, Icon, Text } from 'soapbox/components/ui';
import { Group } from 'soapbox/types/entities';

interface IGroupPolicy {
  group: Group
}

const GroupPrivacy = ({ group }: IGroupPolicy) => (
  <HStack space={1} alignItems='center' data-testid='group-privacy'>
    <Icon
      className='h-4 w-4'
      src={
        group.locked
          ? require('@tabler/icons/lock.svg')
          : require('@tabler/icons/world.svg')
      }
    />

    <Text theme='inherit' tag='span' size='sm' weight='medium'>
      {group.locked ? (
        <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
      ) : (
        <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
      )}
    </Text>
  </HStack>
);

export default GroupPrivacy;