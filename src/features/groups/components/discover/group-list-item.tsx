import lockIcon from '@tabler/icons/outline/lock.svg';
import worldIcon from '@tabler/icons/outline/world.svg';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import GroupAvatar from 'soapbox/components/groups/group-avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import GroupActionButton from 'soapbox/features/group/components/group-action-button.tsx';
import { Group as GroupEntity } from 'soapbox/types/entities.ts';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

interface IGroupListItem {
  group: GroupEntity;
  withJoinAction?: boolean;
}

const GroupListItem = (props: IGroupListItem) => {
  const { group, withJoinAction = true } = props;

  return (
    <HStack
      alignItems='center'
      justifyContent='between'
      data-testid='group-list-item'
    >
      <Link key={group.id} to={`/group/${group.slug}`} className='overflow-hidden'>
        <HStack alignItems='center' space={2}>
          <GroupAvatar
            group={group}
            size={44}
          />

          <Stack className='overflow-hidden'>
            <Text
              weight='bold'
              dangerouslySetInnerHTML={{ __html: group.display_name_html }}
              truncate
            />

            <HStack className='text-gray-700 dark:text-gray-600' space={1} alignItems='center'>
              <Icon
                className='size-4.5'
                src={group.locked ? lockIcon : worldIcon}
              />

              <Text theme='inherit' tag='span' size='sm' weight='medium'>
                {group.locked ? (
                  <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
                ) : (
                  <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
                )}
              </Text>

              {typeof group.members_count !== 'undefined' && (
                <>
                  <span>&bull;</span> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
                  <Text theme='inherit' tag='span' size='sm' weight='medium'>
                    {shortNumberFormat(group.members_count)}
                    {' '} {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
                    <FormattedMessage
                      id='groups.discover.search.results.member_count'
                      defaultMessage='{members, plural, one {member} other {members}}'
                      values={{
                        members: group.members_count,
                      }}
                    />
                  </Text>
                </>
              )}
            </HStack>
          </Stack>
        </HStack>
      </Link>

      {withJoinAction && (
        <GroupActionButton group={group} />
      )}
    </HStack>
  );
};

export default GroupListItem;
