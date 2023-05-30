import React from 'react';

import { useSuggestedGroups } from 'soapbox/api/hooks';
import { Widget } from 'soapbox/components/ui';
import GroupListItem from 'soapbox/features/groups/components/discover/group-list-item';
import PlaceholderGroupSearch from 'soapbox/features/placeholder/components/placeholder-group-search';

const SuggestedGroupsPanel = () => {
  const { groups, isFetching, isFetched, isError } = useSuggestedGroups();
  const isEmpty = (isFetched && groups.length === 0) || isError;

  if (isEmpty) {
    return null;
  }

  return (
    <Widget
      title='Suggested Groups'
    >
      {isFetching ? (
        new Array(3).fill(0).map((_, idx) => (
          <PlaceholderGroupSearch key={idx} withJoinAction={false} />
        ))
      ) : (
        groups.slice(0, 3).map((group) => (
          <GroupListItem group={group} withJoinAction={false} key={group.id} />
        ))
      )}
    </Widget>
  );
};

export default SuggestedGroupsPanel;
