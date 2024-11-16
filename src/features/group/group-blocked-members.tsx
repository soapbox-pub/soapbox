import { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchGroupBlocks, groupUnblock } from 'soapbox/actions/groups.ts';
import { useAccount, useGroup } from 'soapbox/api/hooks/index.ts';
import Account from 'soapbox/components/account.tsx';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import toast from 'soapbox/toast.tsx';

import ColumnForbidden from '../ui/components/column-forbidden.tsx';

type RouteParams = { groupId: string };

const messages = defineMessages({
  heading: { id: 'column.group_blocked_members', defaultMessage: 'Banned Members' },
  unblock: { id: 'group.group_mod_unblock', defaultMessage: 'Unban' },
  unblocked: { id: 'group.group_mod_unblock.success', defaultMessage: 'Unbanned @{name} from group' },
});

interface IBlockedMember {
  accountId: string;
  groupId: string;
}

const BlockedMember: React.FC<IBlockedMember> = ({ accountId, groupId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useAccount(accountId);

  if (!account) return null;

  const handleUnblock = () =>
    dispatch(groupUnblock(groupId, accountId))
      .then(() => toast.success(intl.formatMessage(messages.unblocked, { name: account.acct })));

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>

      <Button
        theme='secondary'
        text={intl.formatMessage(messages.unblock)}
        onClick={handleUnblock}
      />
    </HStack>
  );
};

interface IGroupBlockedMembers {
  params: RouteParams;
}

const GroupBlockedMembers: React.FC<IGroupBlockedMembers> = ({ params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const id = params?.groupId;

  const { group } = useGroup(id);
  const accountIds = useAppSelector((state) => state.user_lists.group_blocks.get(id)?.items);

  useEffect(() => {
    dispatch(fetchGroupBlocks(id));
  }, [id]);

  if (!group || !group.relationship || !accountIds) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Spinner />
      </Column>
    );
  }

  if (!group.relationship.role || !['owner', 'admin', 'moderator'].includes(group.relationship.role)) {
    return (<ColumnForbidden />);
  }

  const emptyMessage = <FormattedMessage id='empty_column.group_blocks' defaultMessage="The group hasn't banned any users yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref={`/group/${group.slug}/manage`}>
      <ScrollableList
        scrollKey='group_blocks'
        emptyMessage={emptyMessage}
        emptyMessageCard={false}
      >
        {accountIds.map((accountId) =>
          <BlockedMember key={accountId} accountId={accountId} groupId={id} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default GroupBlockedMembers;
