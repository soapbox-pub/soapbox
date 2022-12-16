import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { expandGroupMemberships, fetchGroup, fetchGroupMemberships } from 'soapbox/actions/groups';
import ScrollableList from 'soapbox/components/scrollable-list';
import { CardHeader, CardTitle } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import type { List } from 'soapbox/reducers/group-memberships';

type RouteParams = { id: string };

interface IGroupMembers {
  params: RouteParams,
}

const messages = defineMessages({
  adminSubheading: { id: 'groups.admin_subheading', defaultMessage: 'Group administrators' },
  moderatorSubheading: { id: 'groups.moderator_subheading', defaultMessage: 'Group moderators' },
  userSubheading: { id: 'groups.user_subheading', defaultMessage: 'Users' },
});

const GroupMembers: React.FC<IGroupMembers> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const groupId = props.params.id;

  const admins = useAppSelector((state) => state.group_memberships.admin.get(groupId));
  const moderators = useAppSelector((state) => state.group_memberships.moderator.get(groupId));
  const users = useAppSelector((state) => state.group_memberships.user.get(groupId));

  const handleLoadMore = (role: 'admin' | 'moderator' | 'user') => {
    dispatch(expandGroupMemberships(groupId, role));
  };

  const handleLoadMoreAdmins = useCallback(debounce(() => {
    handleLoadMore('admin');
  }, 300, { leading: true }), []);

  const handleLoadMoreModerators = useCallback(debounce(() => {
    handleLoadMore('moderator');
  }, 300, { leading: true }), []);

  const handleLoadMoreUsers = useCallback(debounce(() => {
    handleLoadMore('user');
  }, 300, { leading: true }), []);

  const renderMemberships = (memberships: List | undefined, role: 'admin' | 'moderator' | 'user', handler: () => void) => {
    if (!memberships?.isLoading && !memberships?.items.count()) return;

    return (
      <React.Fragment key={role}>
        <CardHeader className='mt-4'>
          <CardTitle title={intl.formatMessage(messages[`${role}Subheading`])} />
        </CardHeader>
        <ScrollableList
          scrollKey={`group_${role}s-${groupId}`}
          hasMore={!!memberships?.next}
          onLoadMore={handler}
          isLoading={memberships?.isLoading}
        >
          {memberships?.items?.map(accountId => <AccountContainer key={accountId} id={accountId} withRelationship={false} />)}
        </ScrollableList>
      </React.Fragment>
    );
  };

  useEffect(() => {
    dispatch(fetchGroup(groupId));

    dispatch(fetchGroupMemberships(groupId, 'admin'));
    dispatch(fetchGroupMemberships(groupId, 'moderator'));
    dispatch(fetchGroupMemberships(groupId, 'user'));
  }, [groupId]);

  return (
    <>
      {renderMemberships(admins, 'admin', handleLoadMoreAdmins)}
      {renderMemberships(moderators, 'moderator', handleLoadMoreModerators)}
      {renderMemberships(users, 'user', handleLoadMoreUsers)}
    </>
  );
};

export default GroupMembers;
