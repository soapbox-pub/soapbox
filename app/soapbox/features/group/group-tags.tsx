import React from 'react';

import ScrollableList from 'soapbox/components/scrollable-list';
import { useGroupTags } from 'soapbox/hooks/api';
import { useGroup } from 'soapbox/queries/groups';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import GroupTagListItem from './components/group-tag-list-item';

import type { Group } from 'soapbox/types/entities';

interface IGroupTopics {
  params: { id: string }
}

const GroupTopics: React.FC<IGroupTopics> = (props) => {
  const groupId = props.params.id;

  const { group, isFetching: isFetchingGroup } = useGroup(groupId);
  const { tags, isFetching: isFetchingTags, hasNextPage, fetchNextPage } = useGroupTags(groupId);

  const isLoading = isFetchingGroup || isFetchingTags;

  const pinnedTags = tags.filter((tag) => tag.pinned);
  const isPinnable = pinnedTags.length < 3;

  return (
    <>
      <ScrollableList
        scrollKey='group-tags'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isLoading={isLoading || !group}
        showLoading={!group || isLoading && tags.length === 0}
        placeholderComponent={PlaceholderAccount}
        placeholderCount={3}
        className='divide-y divide-solid divide-gray-300'
        itemClassName='py-3 last:pb-0'
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
    </>
  );
};

export default GroupTopics;
