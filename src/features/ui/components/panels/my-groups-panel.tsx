import { useGroups } from '@/api/hooks/index.ts';
import Widget from '@/components/ui/widget.tsx';
import GroupListItem from '@/features/groups/components/discover/group-list-item.tsx';
import PlaceholderGroupSearch from '@/features/placeholder/components/placeholder-group-search.tsx';

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

export default MyGroupsPanel;
