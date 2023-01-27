import React, { useCallback, useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchGroup, fetchGroupBlocks, groupUnblock } from 'soapbox/actions/groups';
import Account from 'soapbox/components/account';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Column, HStack, Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetAccount, makeGetGroup } from 'soapbox/selectors';
import toast from 'soapbox/toast';

import ColumnForbidden from '../ui/components/column-forbidden';

type RouteParams = { id: string };

const messages = defineMessages({
  heading: { id: 'column.group_blocked_members', defaultMessage: 'Blocked members' },
  unblock: { id: 'group.group_mod_unblock', defaultMessage: 'Unblock' },
  unblocked: { id: 'group.group_mod_unblock.success', defaultMessage: 'Unblocked @{name} from group' },
});

interface IBlockedMember {
  accountId: string
  groupId: string
}

const BlockedMember: React.FC<IBlockedMember> = ({ accountId, groupId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) => getAccount(state, accountId));

  if (!account) return null;

  const handleUnblock = () =>
    dispatch(groupUnblock(groupId, accountId)).then(() => {
      toast.success(intl.formatMessage(messages.unblocked, { name: account.acct }));
    });

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>
      <Button
        theme='danger'
        size='sm'
        text={intl.formatMessage(messages.unblock)}
        onClick={handleUnblock}
      />
    </HStack>
  );
};

interface IGroupBlockedMembers {
  params: RouteParams
}

const GroupBlockedMembers: React.FC<IGroupBlockedMembers> = ({ params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const id = params?.id || '';

  const getGroup = useCallback(makeGetGroup(), []);
  const group = useAppSelector(state => getGroup(state, id));
  const accountIds = useAppSelector((state) => state.user_lists.group_blocks.get(id)?.items);

  useEffect(() => {
    if (!group) dispatch(fetchGroup(id));
    dispatch(fetchGroupBlocks(id));
  }, [id]);

  if (!group || !group.relationship || !accountIds) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const emptyMessage = <FormattedMessage id='empty_column.group_blocks' defaultMessage="The group hasn't blocked any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/groups/${id}/manage`}>
      <ScrollableList
        scrollKey='group_blocks'
        emptyMessage={emptyMessage}
      >
        {accountIds.map((accountId) =>
          <BlockedMember key={accountId} accountId={accountId} groupId={id} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default GroupBlockedMembers;
