import React, { useMemo } from 'react';

import ScrollableList from 'soapbox/components/scrollable-list';
import { useGroupMembers } from 'soapbox/hooks/api/useGroupMembers';
import { useGroupRoles } from 'soapbox/hooks/useGroupRoles';
import { useGroup } from 'soapbox/queries/groups';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import GroupMemberListItem from './components/group-member-list-item';

import type { Group } from 'soapbox/types/entities';

interface IGroupMembers {
  params: { id: string }
}

const GroupMembers: React.FC<IGroupMembers> = (props) => {
  const { roles: { admin, moderator, user } } = useGroupRoles();

  const groupId = props.params.id;

  const { group, isFetching: isFetchingGroup } = useGroup(groupId);
  const { groupMembers: admins, isFetching: isFetchingAdmins } = useGroupMembers(groupId, admin);
  const { groupMembers: moderators, isFetching: isFetchingModerators } = useGroupMembers(groupId, moderator);
  const { groupMembers: users, isFetching: isFetchingUsers, fetchNextPage, hasNextPage } = useGroupMembers(groupId, user);

  const isLoading = isFetchingGroup || isFetchingAdmins || isFetchingModerators || isFetchingUsers;

  const members = useMemo(() => [
    ...admins,
    ...moderators,
    ...users,
  ], [admins, moderators, users]);

  return (
    <>
      <ScrollableList
        scrollKey='group-members'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isLoading={isLoading || !group}
        showLoading={!group || isLoading && members.length === 0}
        placeholderComponent={PlaceholderAccount}
        placeholderCount={3}
        className='divide-y divide-solid divide-gray-300'
        itemClassName='py-3 last:pb-0'
      >
        {members.map((member) => (
          <GroupMemberListItem
            group={group as Group}
            member={member}
            key={member?.account}
          />
        ))}
      </ScrollableList>
    </>
  );
};

export default GroupMembers;
