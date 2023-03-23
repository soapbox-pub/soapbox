import React from 'react';

import { Widget } from 'soapbox/components/ui';
import GroupListItem from 'soapbox/features/groups/components/discover/group-list-item';
import PlaceholderGroupSearch from 'soapbox/features/placeholder/components/placeholder-group-search';
import { useGroups } from 'soapbox/hooks/api';

const MyGroupsPanel = () => {
  const { groups, isFetching, isFetched, isError } = useGroups();
  const isEmpty = (isFetched && groups.length === 0) || isError;

  if (isEmpty) {
    return null;
  }

  return (
    <Widget
      title='My Groups'
    >
      {isFetching ? (
        new Array(3).fill(0).map((_, idx) => (
          <PlaceholderGroupSearch key={idx} />
        ))
      ) : (
        groups.slice(0, 3).map((group) => (
          <GroupListItem group={group} withJoinAction={false} key={group.id} />
        ))
      )}
    </Widget>
  );
};

export default MyGroupsPanel;
