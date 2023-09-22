import clsx from 'clsx';
import React, { useMemo } from 'react';

import { useGroup, useGroupMembers, useGroupMembershipRequests } from 'soapbox/api/hooks';
import { PendingItemsRow } from 'soapbox/components/pending-items-row';
import ScrollableList from 'soapbox/components/scrollable-list';
import { useFeatures } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import GroupMemberListItem from './components/group-member-list-item';

import type { Group } from 'soapbox/types/entities';


interface IGroupMembers {
  params: { groupId: string }
}

export const MAX_ADMIN_COUNT = 5;

const GroupMembers: React.FC<IGroupMembers> = (props) => {
  const { groupId } = props.params;

  const features = useFeatures();

  const { group, isFetching: isFetchingGroup } = useGroup(groupId);
  const { groupMembers: owners, isFetching: isFetchingOwners } = useGroupMembers(groupId, GroupRoles.OWNER);
  const { groupMembers: admins, isFetching: isFetchingAdmins } = useGroupMembers(groupId, GroupRoles.ADMIN);
  const { groupMembers: users, isFetching: isFetchingUsers, fetchNextPage, hasNextPage } = useGroupMembers(groupId, GroupRoles.USER);
  const { isFetching: isFetchingPending, count: pendingCount } = useGroupMembershipRequests(groupId);

  const isLoading = isFetchingGroup || isFetchingOwners || isFetchingAdmins || isFetchingUsers || isFetchingPending;

  const members = useMemo(() => [
    ...owners,
    ...admins,
    ...users,
  ], [owners, admins, users]);

  const canPromoteToAdmin = features.groupsAdminMax
    ? members.filter((member) => member.role === GroupRoles.ADMIN).length < MAX_ADMIN_COUNT
    : true;

  return (
    <>
      <ScrollableList
        scrollKey='group-members'
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isLoading={!group || isLoading}
        showLoading={!group || isFetchingPending || isLoading && members.length === 0}
        placeholderComponent={PlaceholderAccount}
        placeholderCount={3}
        className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
        itemClassName='py-3 last:pb-0'
        prepend={(pendingCount > 0) && (
          <div className={clsx('py-3', { 'border-b border-gray-200 dark:border-gray-800': members.length })}>
            <PendingItemsRow
              to={`/group/${group?.slug}/manage/requests`}
              count={pendingCount}
            />
          </div>
        )}
      >
        {members.map((member) => (
          <GroupMemberListItem
            group={group as Group}
            member={member}
            key={member.account.id}
            canPromoteToAdmin={canPromoteToAdmin}
          />
        ))}
      </ScrollableList>
    </>
  );
};

export default GroupMembers;
