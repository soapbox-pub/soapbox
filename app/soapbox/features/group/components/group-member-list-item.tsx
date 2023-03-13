import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { groupBlock, groupDemoteAccount, groupKick, groupPromoteAccount } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import Account from 'soapbox/components/account';
import { HStack, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuLink, MenuList } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAccount, useAppDispatch } from 'soapbox/hooks';
import { BaseGroupRoles, useGroupRoles } from 'soapbox/hooks/useGroupRoles';
import toast from 'soapbox/toast';

import type { Menu as IMenu } from 'soapbox/components/dropdown-menu';
import type { Account as AccountEntity, Group, GroupMember } from 'soapbox/types/entities';

const messages = defineMessages({
  blockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Block' },
  blockFromGroupMessage: { id: 'confirmations.block_from_group.message', defaultMessage: 'Are you sure you want to block @{name} from interacting with this group?' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: 'Blocked @{name} from group' },
  demotedToUser: { id: 'group.group_mod_demote.success', defaultMessage: 'Demoted @{name} to group user' },
  groupModBlock: { id: 'group.group_mod_block', defaultMessage: 'Block @{name} from group' },
  groupModDemote: { id: 'group.group_mod_demote', defaultMessage: 'Demote @{name}' },
  groupModKick: { id: 'group.group_mod_kick', defaultMessage: 'Kick @{name} from group' },
  groupModPromoteAdmin: { id: 'group.group_mod_promote_admin', defaultMessage: 'Promote @{name} to group administrator' },
  groupModPromoteMod: { id: 'group.group_mod_promote_mod', defaultMessage: 'Promote @{name} to group moderator' },
  kickConfirm: { id: 'confirmations.kick_from_group.confirm', defaultMessage: 'Kick' },
  kickFromGroupMessage: { id: 'confirmations.kick_from_group.message', defaultMessage: 'Are you sure you want to kick @{name} from this group?' },
  kicked: { id: 'group.group_mod_kick.success', defaultMessage: 'Kicked @{name} from group' },
  promoteConfirm: { id: 'confirmations.promote_in_group.confirm', defaultMessage: 'Promote' },
  promoteConfirmMessage: { id: 'confirmations.promote_in_group.message', defaultMessage: 'Are you sure you want to promote @{name}? You will not be able to demote them.' },
  promotedToAdmin: { id: 'group.group_mod_promote_admin.success', defaultMessage: 'Promoted @{name} to group administrator' },
  promotedToMod: { id: 'group.group_mod_promote_mod.success', defaultMessage: 'Promoted @{name} to group moderator' },
});

interface IGroupMemberListItem {
  member: GroupMember
  group: Group
}

const GroupMemberListItem = (props: IGroupMemberListItem) => {
  const { member, group } = props;

  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { normalizeRole } = useGroupRoles();

  const account = useAccount(member.account.id) as AccountEntity;

  // Current user role
  const isCurrentUserAdmin = normalizeRole(group.relationship?.role as any) === BaseGroupRoles.ADMIN;
  const isCurrentUserModerator = normalizeRole(group.relationship?.role as any) === BaseGroupRoles.MODERATOR;

  // Member role
  const isMemberAdmin = normalizeRole(member.role as any) === BaseGroupRoles.ADMIN;
  const isMemberModerator = normalizeRole(member.role as any) === BaseGroupRoles.MODERATOR;
  const isMemberUser = normalizeRole(member.role as any) === BaseGroupRoles.USER;

  const handleKickFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.kickFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.kickConfirm),
      onConfirm: () => dispatch(groupKick(group.id, account.id)).then(() =>
        toast.success(intl.formatMessage(messages.kicked, { name: account.acct })),
      ),
    }));
  };

  const handleBlockFromGroup = () => {
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.blockFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(groupBlock(group.id, account.id)).then(() =>
        toast.success(intl.formatMessage(messages.blocked, { name: account.acct })),
      ),
    }));
  };

  const onPromote = (role: 'admin' | 'moderator', warning?: boolean) => {
    if (warning) {
      return dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(messages.promoteConfirmMessage, { name: account.username }),
        confirm: intl.formatMessage(messages.promoteConfirm),
        onConfirm: () => dispatch(groupPromoteAccount(group.id, account.id, role)).then(() =>
          toast.success(intl.formatMessage(role === 'admin' ? messages.promotedToAdmin : messages.promotedToMod, { name: account.acct })),
        ),
      }));
    } else {
      return dispatch(groupPromoteAccount(group.id, account.id, role)).then(() =>
        toast.success(intl.formatMessage(role === 'admin' ? messages.promotedToAdmin : messages.promotedToMod, { name: account.acct })),
      );
    }
  };

  const handlePromoteToGroupAdmin = () => onPromote('admin', true);

  const handlePromoteToGroupMod = () => {
    onPromote('moderator', group.relationship!.role === 'moderator');
  };

  const handleDemote = () => {
    dispatch(groupDemoteAccount(group.id, account.id, 'user')).then(() =>
      toast.success(intl.formatMessage(messages.demotedToUser, { name: account.acct })),
    ).catch(() => {});
  };

  const menu: IMenu = useMemo(() => {
    const items: IMenu = [];

    if (!group || !account || !group.relationship?.role) {
      return items;
    }

    if (
      (isCurrentUserAdmin || isCurrentUserModerator) &&
      (isMemberModerator || isMemberUser) &&
      member.role !== group.relationship.role
    ) {
      items.push({
        text: intl.formatMessage(messages.groupModKick, { name: account.username }),
        icon: require('@tabler/icons/user-minus.svg'),
        action: handleKickFromGroup,
      });
      items.push({
        text: intl.formatMessage(messages.groupModBlock, { name: account.username }),
        icon: require('@tabler/icons/ban.svg'),
        action: handleBlockFromGroup,
      });
    }

    if (isCurrentUserAdmin && !isMemberAdmin && account.acct === account.username) {
      items.push(null);

      if (isMemberModerator) {
        items.push({
          text: intl.formatMessage(messages.groupModPromoteAdmin, { name: account.username }),
          icon: require('@tabler/icons/arrow-up-circle.svg'),
          action: handlePromoteToGroupAdmin,
        });
        items.push({
          text: intl.formatMessage(messages.groupModDemote, { name: account.username }),
          icon: require('@tabler/icons/arrow-down-circle.svg'),
          action: handleDemote,
        });
      } else if (isMemberUser) {
        items.push({
          text: intl.formatMessage(messages.groupModPromoteMod, { name: account.username }),
          icon: require('@tabler/icons/arrow-up-circle.svg'),
          action: handlePromoteToGroupMod,
        });
      }
    }

    return items;
  }, [group, account]);

  return (
    <HStack alignItems='center' justifyContent='between'>
      <div className='w-full'>
        <Account account={member.account} withRelationship={false} />
      </div>

      <HStack alignItems='center' space={2}>
        {(isMemberAdmin || isMemberModerator) ? (
          <span
            className={
              clsx('inline-flex items-center rounded px-2 py-1 text-xs font-medium capitalize', {
                'bg-primary-200 text-primary-500': isMemberAdmin,
                'bg-gray-200 text-gray-900': isMemberModerator,
              })
            }
          >
            {member.role}
          </span>
        ) : null}

        {menu.length > 0 && (
          <Menu>
            <MenuButton
              as={IconButton}
              src={require('@tabler/icons/dots.svg')}
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
                      <HStack space={2} alignItems='center'>
                        {menuItem.icon && (
                          <SvgIcon src={menuItem.icon} className='h-4 w-4 flex-none text-gray-700 group-hover:text-gray-800' />
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
    </HStack>
  );
};

export default GroupMemberListItem;