import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { authorizeGroupMembershipRequest, rejectGroupMembershipRequest } from 'soapbox/actions/groups';
import Account from 'soapbox/components/account';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Column, HStack, Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useGroup } from 'soapbox/hooks';
import { useGroupMembershipRequests } from 'soapbox/hooks/api/groups/useGroupMembershipRequests';
import toast from 'soapbox/toast';

import ColumnForbidden from '../ui/components/column-forbidden';

import type { Account as AccountEntity } from 'soapbox/schemas';

type RouteParams = { id: string };

const messages = defineMessages({
  heading: { id: 'column.group_pending_requests', defaultMessage: 'Pending requests' },
  authorize: { id: 'group.group_mod_authorize', defaultMessage: 'Accept' },
  authorized: { id: 'group.group_mod_authorize.success', defaultMessage: 'Accepted @{name} to group' },
  reject: { id: 'group.group_mod_reject', defaultMessage: 'Reject' },
  rejected: { id: 'group.group_mod_reject.success', defaultMessage: 'Rejected @{name} from group' },
});

interface IMembershipRequest {
  account: AccountEntity
  groupId: string
}

const MembershipRequest: React.FC<IMembershipRequest> = ({ account, groupId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  if (!account) return null;

  const handleAuthorize = () =>
    dispatch(authorizeGroupMembershipRequest(groupId, account.id)).then(() => {
      toast.success(intl.formatMessage(messages.authorized, { name: account.acct }));
    });

  const handleReject = () =>
    dispatch(rejectGroupMembershipRequest(groupId, account.id)).then(() => {
      toast.success(intl.formatMessage(messages.rejected, { name: account.acct }));
    });

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>
      <HStack space={2}>
        <Button
          theme='secondary'
          size='sm'
          text={intl.formatMessage(messages.authorize)}
          onClick={handleAuthorize}
        />
        <Button
          theme='danger'
          size='sm'
          text={intl.formatMessage(messages.reject)}
          onClick={handleReject}
        />
      </HStack>
    </HStack>
  );
};

interface IGroupMembershipRequests {
  params: RouteParams
}

const GroupMembershipRequests: React.FC<IGroupMembershipRequests> = ({ params }) => {
  const intl = useIntl();

  const id = params?.id;

  const { group } = useGroup(id);
  const { entities: accounts, isLoading } = useGroupMembershipRequests(id);

  if (!group || !group.relationship || isLoading) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const emptyMessage = <FormattedMessage id='empty_column.group_membership_requests' defaultMessage='There are no pending membership requests for this group.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/groups/${id}/manage`}>
      <ScrollableList
        scrollKey='group_membership_requests'
        emptyMessage={emptyMessage}
      >
        {accounts.map((account) =>
          <MembershipRequest key={account.id} account={account} groupId={id} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default GroupMembershipRequests;
