import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from 'soapbox/components/account';
import { AuthorizeRejectButtons } from 'soapbox/components/authorize-reject-buttons';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, HStack, Spinner } from 'soapbox/components/ui';
import { useGroup } from 'soapbox/hooks';
import { useGroupMembershipRequests } from 'soapbox/hooks/api/groups/useGroupMembershipRequests';
import toast from 'soapbox/toast';

import ColumnForbidden from '../ui/components/column-forbidden';

import type { Account as AccountEntity } from 'soapbox/schemas';

type RouteParams = { id: string };

const messages = defineMessages({
  heading: { id: 'column.group_pending_requests', defaultMessage: 'Pending requests' },
  authorize: { id: 'group.group_mod_authorize', defaultMessage: 'Accept' },
  authorized: { id: 'group.group_mod_authorize.success', defaultMessage: 'Accepted @{name} to group' },
  authorizeFail: { id: 'group.group_mod_authorize.fail', defaultMessage: 'Failed to approve @{name}' },
  reject: { id: 'group.group_mod_reject', defaultMessage: 'Reject' },
  rejected: { id: 'group.group_mod_reject.success', defaultMessage: 'Rejected @{name} from group' },
  rejectFail: { id: 'group.group_mod_reject.fail', defaultMessage: 'Failed to reject @{name}' },
});

interface IMembershipRequest {
  account: AccountEntity
  onAuthorize(accountId: string): Promise<unknown>
  onReject(accountId: string): Promise<unknown>
}

const MembershipRequest: React.FC<IMembershipRequest> = ({ account, onAuthorize, onReject }) => {
  const intl = useIntl();

  if (!account) return null;

  function handleAuthorize(accountId: string) {
    return onAuthorize(accountId)
      .catch(() => toast.error(intl.formatMessage(messages.authorizeFail, { name: account.username })));
  }

  function handleReject(accountId: string) {
    return onReject(accountId)
      .catch(() => toast.error(intl.formatMessage(messages.rejectFail, { name: account.username })));
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <AuthorizeRejectButtons
        id={account.id}
        onAuthorize={handleAuthorize}
        onReject={handleReject}
      />
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
  const { accounts, isLoading, authorize, reject } = useGroupMembershipRequests(id);

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

  const handleAuthorize = (accountId: string) => authorize(accountId);
  const handleReject = (accountId: string) => reject(accountId);

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/groups/${id}/manage`}>
      <ScrollableList
        scrollKey='group_membership_requests'
        emptyMessage={<FormattedMessage id='empty_column.group_membership_requests' defaultMessage='There are no pending membership requests for this group.' />}
      >
        {accounts.map((account) => (
          <MembershipRequest
            key={account.id}
            account={account}
            onAuthorize={handleAuthorize}
            onReject={handleReject}
          />
        ))}
      </ScrollableList>
    </Column>
  );
};

export default GroupMembershipRequests;
