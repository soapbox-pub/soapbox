import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { expandGroupMemberships, fetchGroup, fetchGroupMemberships, groupBlock, groupDemoteAccount, groupKick, groupPromoteAccount } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import Account from 'soapbox/components/account';
import ScrollableList from 'soapbox/components/scrollable-list';
import { CardHeader, CardTitle, HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuLink, MenuList } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import toast from 'soapbox/toast';

import PlaceholderAccount from '../placeholder/components/placeholder-account';

import type { Menu as MenuType } from 'soapbox/components/dropdown-menu';
import type { GroupRole, List } from 'soapbox/reducers/group-memberships';
import type { GroupRelationship } from 'soapbox/types/entities';

type RouteParams = { id: string };

const messages = defineMessages({
  adminSubheading: { id: 'group.admin_subheading', defaultMessage: 'Group administrators' },
  moderatorSubheading: { id: 'group.moderator_subheading', defaultMessage: 'Group moderators' },
  userSubheading: { id: 'group.user_subheading', defaultMessage: 'Users' },
  groupModKick: { id: 'group.group_mod_kick', defaultMessage: 'Kick @{name} from group' },
  groupModBlock: { id: 'group.group_mod_block', defaultMessage: 'Block @{name} from group' },
  groupModPromoteAdmin: { id: 'group.group_mod_promote_admin', defaultMessage: 'Promote @{name} to group administrator' },
  groupModPromoteMod: { id: 'group.group_mod_promote_mod', defaultMessage: 'Promote @{name} to group moderator' },
  groupModDemote: { id: 'group.group_mod_demote', defaultMessage: 'Demote @{name}' },
  kickFromGroupMessage: { id: 'confirmations.kick_from_group.message', defaultMessage: 'Are you sure you want to kick @{name} from this group?' },
  kickConfirm: { id: 'confirmations.kick_from_group.confirm', defaultMessage: 'Kick' },
  blockFromGroupMessage: { id: 'confirmations.block_from_group.message', defaultMessage: 'Are you sure you want to block @{name} from interacting with this group?' },
  blockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Block' },
  promoteConfirmMessage: { id: 'confirmations.promote_in_group.message', defaultMessage: 'Are you sure you want to promote @{name}? You will not be able to demote them.' },
  promoteConfirm: { id: 'confirmations.promote_in_group.confirm', defaultMessage: 'Promote' },
  kicked: { id: 'group.group_mod_kick.success', defaultMessage: 'Kicked @{name} from group' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: 'Blocked @{name} from group' },
  promotedToAdmin: { id: 'group.group_mod_promote_admin.success', defaultMessage: 'Promoted @{name} to group administrator' },
  promotedToMod: { id: 'group.group_mod_promote_mod.success', defaultMessage: 'Promoted @{name} to group moderator' },
  demotedToUser: { id: 'group.group_mod_demote.success', defaultMessage: 'Demoted @{name} to group user' },
});

interface IGroupMember {
  accountId: string
  accountRole: GroupRole
  groupId: string
  relationship?: GroupRelationship
}

const GroupMember: React.FC<IGroupMember> = ({ accountId, accountRole, groupId, relationship }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) => getAccount(state, accountId));

  if (!account) return null;

  const handleKickFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.kickFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.kickConfirm),
      onConfirm: () => dispatch(groupKick(groupId, account.id)).then(() =>
        toast.success(intl.formatMessage(messages.kicked, { name: account.acct })),
      ),
    }));
  };

  const handleBlockFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.blockFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(groupBlock(groupId, account.id)).then(() =>
        toast.success(intl.formatMessage(messages.blocked, { name: account.acct })),
      ),
    }));
  };

  const onPromote = (role: 'admin' | 'moderator', warning?: boolean) => {
    if (warning) {
      return dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(messages.promoteConfirmMessage, { name: account.username }),
        confirm: intl.formatMessage(messages.promoteConfirm),
        onConfirm: () => dispatch(groupPromoteAccount(groupId, account.id, role)).then(() =>
          toast.success(intl.formatMessage(role === 'admin' ? messages.promotedToAdmin : messages.promotedToMod, { name: account.acct })),
        ),
      }));
    } else {
      return dispatch(groupPromoteAccount(groupId, account.id, role)).then(() =>
        toast.success(intl.formatMessage(role === 'admin' ? messages.promotedToAdmin : messages.promotedToMod, { name: account.acct })),
      );
    }
  };

  const handlePromoteToGroupAdmin = () => {
    onPromote('admin', true);
  };

  const handlePromoteToGroupMod = () => {
    onPromote('moderator', relationship!.role === 'moderator');
  };

  const handleDemote = () => {
    dispatch(groupDemoteAccount(groupId, account.id, 'user')).then(() =>
      toast.success(intl.formatMessage(messages.demotedToUser, { name: account.acct })),
    ).catch(() => {});
  };

  const makeMenu = () => {
    const menu: MenuType = [];

    if (!relationship || !relationship.role) return menu;

    if (['admin', 'moderator'].includes(relationship.role) && ['moderator', 'user'].includes(accountRole) && accountRole !== relationship.role) {
      menu.push({
        text: intl.formatMessage(messages.groupModKick, { name: account.username }),
        icon: require('@tabler/icons/user-minus.svg'),
        action: handleKickFromGroup,
      });
      menu.push({
        text: intl.formatMessage(messages.groupModBlock, { name: account.username }),
        icon: require('@tabler/icons/ban.svg'),
        action: handleBlockFromGroup,
      });
    }

    if (relationship.role === 'admin' && accountRole !== 'admin' && account.acct === account.username) {
      menu.push(null);
      switch (accountRole) {
        case 'moderator':
          menu.push({
            text: intl.formatMessage(messages.groupModPromoteAdmin, { name: account.username }),
            icon: require('@tabler/icons/arrow-up-circle.svg'),
            action: handlePromoteToGroupAdmin,
          });
          menu.push({
            text: intl.formatMessage(messages.groupModDemote, { name: account.username }),
            icon: require('@tabler/icons/arrow-down-circle.svg'),
            action: handleDemote,
          });
          break;
        case 'user':
          menu.push({
            text: intl.formatMessage(messages.groupModPromoteMod, { name: account.username }),
            icon: require('@tabler/icons/arrow-up-circle.svg'),
            action: handlePromoteToGroupMod,
          });
          break;
      }
    }

    return menu;
  };

  const menu = makeMenu();

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>
      {menu.length > 0 && (
        <Menu>
          <MenuButton
            as={IconButton}
            src={require('@tabler/icons/dots.svg')}
            theme='outlined'
            className='px-2'
            iconClassName='h-4 w-4'
            children={null}
          />

          <MenuList className='w-56'>
            {menu.map((menuItem, idx) => {
              if (typeof menuItem?.text === 'undefined') {
                return <MenuDivider key={idx} />;
              } else {
                const Comp = (menuItem.action ? MenuItem : MenuLink) as any;
                const itemProps = menuItem.action ? { onSelect: menuItem.action } : { to: menuItem.to, as: Link, target: menuItem.target || '_self' };

                return (
                  <Comp key={idx} {...itemProps} className='group'>
                    <HStack space={3} alignItems='center'>
                      {menuItem.icon && (
                        <SvgIcon src={menuItem.icon} className='h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500' />
                      )}

                      <div className='truncate'>{menuItem.text}</div>
                    </HStack>
                  </Comp>
                );
              }
            })}
          </MenuList>
        </Menu>
      )}
    </HStack>
  );
};

interface IGroupMembers {
  params: RouteParams
}

const GroupMembers: React.FC<IGroupMembers> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const groupId = props.params.id;

  const relationship = useAppSelector((state) => state.group_relationships.get(groupId));
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

  const renderMemberships = (memberships: List | undefined, role: GroupRole, handler: () => void) => {
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
          showLoading={memberships?.isLoading && !memberships?.items?.count()}
          placeholderComponent={PlaceholderAccount}
          placeholderCount={3}
          itemClassName='pb-4 last:pb-0'
        >
          {memberships?.items?.map(accountId => (
            <GroupMember
              key={accountId}
              accountId={accountId}
              accountRole={role}
              groupId={groupId}
              relationship={relationship}
            />
          ))}
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
