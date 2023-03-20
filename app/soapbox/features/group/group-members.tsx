import React, { useMemo } from 'react';

import ScrollableList from 'soapbox/components/scrollable-list';
import { useGroupMembers } from 'soapbox/hooks/api/useGroupMembers';
import { useGroup } from 'soapbox/queries/groups';
import { GroupRoles } from 'soapbox/schemas/group-member';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import GroupMemberListItem from './components/group-member-list-item';

import type { Group } from 'soapbox/types/entities';

interface IGroupMembers {
  params: { id: string }
}

const GroupMembers: React.FC<IGroupMembers> = (props) => {
  const groupId = props.params.id;

  const { group, isFetching: isFetchingGroup } = useGroup(groupId);
  const { groupMembers: owners, isFetching: isFetchingOwners } = useGroupMembers(groupId, GroupRoles.OWNER);
  const { groupMembers: admins, isFetching: isFetchingAdmins } = useGroupMembers(groupId, GroupRoles.ADMIN);
  const { groupMembers: users, isFetching: isFetchingUsers, fetchNextPage, hasNextPage } = useGroupMembers(groupId, GroupRoles.USER);

  const isLoading = isFetchingGroup || isFetchingOwners || isFetchingAdmins || isFetchingUsers;

  const members = useMemo(() => [
    ...owners,
    ...admins,
    ...users,
  ], [owners, admins, users]);

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
            key={member.account.id}
          />
        ))}
      </ScrollableList>
    </>
  );
};

export default GroupMembers;
