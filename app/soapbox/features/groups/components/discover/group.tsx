import React, { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { Group as GroupEntity } from 'soapbox/types/entities';
import { shortNumberFormat } from 'soapbox/utils/numbers';


interface IGroup {
  group: GroupEntity
  width: number
}

const Group = forwardRef((props: IGroup, ref: React.ForwardedRef<HTMLDivElement>) => {
  const { group, width = 'auto' } = props;

  return (
    <div
      key={group.id}
      className='relative flex shrink-0 flex-col space-y-2 px-0.5'
      style={{
        width,
      }}
    >
      <Stack
        className='aspect-w-10 aspect-h-7 h-full w-full overflow-hidden rounded-lg'
        ref={ref}
        style={{ minHeight: 180 }}
      >
        {group.header && (
          <img
            src={group.header}
            alt='Group cover'
            className='absolute inset-0 object-cover'
          />
        )}

        <Stack justifyContent='end' className='z-10 p-4 text-white' space={3}>
          <Avatar
            className='ring-2 ring-white'
            src={group.avatar}
            size={44}
          />

          <Stack space={1}>
            <Text
              weight='bold'
              dangerouslySetInnerHTML={{ __html: group.display_name_html }}
              theme='inherit'
              truncate
            />

            <HStack space={1} alignItems='center'>
              <Icon
                className='h-4.5 w-4.5'
                src={group.locked ? require('@tabler/icons/lock.svg') : require('@tabler/icons/world.svg')}
              />

              {typeof group.members_count === 'undefined' ? (
                <Text theme='inherit' tag='span' size='sm'>
                  {group.locked ? (
                    <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
                  ) : (
                    <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
                  )}
                </Text>
              ) : (
                <Text theme='inherit' tag='span' size='sm'>
                  {shortNumberFormat(group.members_count)}
                  {' '}
                  members
                </Text>
              )}
            </HStack>
          </Stack>
        </Stack>

        <div
          className='absolute inset-x-0 bottom-0 z-0 flex justify-center rounded-b-lg bg-gradient-to-t from-gray-900 to-transparent pt-12 pb-8 transition-opacity duration-500'
        />
      </Stack>

      <Button
        theme='primary'
        block
      >
        Join Group
      </Button>
    </div>
  );
});

export default Group;