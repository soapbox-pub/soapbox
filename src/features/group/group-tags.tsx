import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useGroup, useGroupTags } from 'soapbox/api/hooks';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Icon, Stack, Text } from 'soapbox/components/ui';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import GroupTagListItem from './components/group-tag-list-item';

import type { Group } from 'soapbox/types/entities';

interface IGroupTopics {
  params: { groupId: string }
}

const GroupTopics: React.FC<IGroupTopics> = (props) => {
  const { groupId } = props.params;

  const { group, isFetching: isFetchingGroup } = useGroup(groupId);
  const { tags, isFetching: isFetchingTags, hasNextPage, fetchNextPage } = useGroupTags(groupId);

  const isLoading = isFetchingGroup || isFetchingTags;

  const pinnedTags = tags.filter((tag) => tag.pinned);
  const isPinnable = pinnedTags.length < 3;

  return (
    <ScrollableList
      scrollKey='group-tags'
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      isLoading={isLoading || !group}
      showLoading={!group || isLoading && tags.length === 0}
      placeholderComponent={PlaceholderAccount}
      placeholderCount={3}
      className='divide-y divide-solid divide-gray-300 dark:divide-gray-800'
      itemClassName='py-3 last:pb-0'
      emptyMessage={
        <Stack space={4} className='pt-6' justifyContent='center' alignItems='center'>
          <div className='rounded-full bg-gray-200 p-4 dark:bg-gray-800'>
            <Icon
              src={require('@tabler/icons/hash.svg')}
              className='h-6 w-6 text-gray-600'
            />
          </div>

          <Text theme='muted'>
            <FormattedMessage id='group.tags.empty' defaultMessage='There are no topics in this group yet.' />
          </Text>
        </Stack>
      }
      emptyMessageCard={false}
    >
      {tags.map((tag) => (
        <GroupTagListItem
          key={tag.id}
          group={group as Group}
          isPinnable={isPinnable}
          tag={tag}
        />
      ))}
    </ScrollableList>
  );
};

export default GroupTopics;
