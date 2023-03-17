import clsx from 'clsx';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { groupKick } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import Account from 'soapbox/components/account';
import DropdownMenu from 'soapbox/components/dropdown-menu/dropdown-menu';
import { HStack } from 'soapbox/components/ui';
import { deleteEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useAccount, useAppDispatch, useFeatures } from 'soapbox/hooks';
import { useBlockGroupMember, useDemoteGroupMember, usePromoteGroupMember } from 'soapbox/hooks/api';
import { BaseGroupRoles, TruthSocialGroupRoles, useGroupRoles } from 'soapbox/hooks/useGroupRoles';
import toast from 'soapbox/toast';

import type { Menu as IMenu } from 'soapbox/components/dropdown-menu';
import type { Account as AccountEntity, Group, GroupMember } from 'soapbox/types/entities';

const messages = defineMessages({
  blockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Block' },
  blockFromGroupHeading: { id: 'confirmations.block_from_group.heading', defaultMessage: 'Ban From Group' },
  blockFromGroupMessage: { id: 'confirmations.block_from_group.message', defaultMessage: 'Are you sure you want to ban @{name} from the group?' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: 'You have successfully blocked @{name} from the group' },
  demotedToUser: { id: 'group.group_mod_demote.success', defaultMessage: 'Demoted @{name} to group user' },
  groupModBlock: { id: 'group.group_mod_block', defaultMessage: 'Ban from group' },
  groupModDemote: { id: 'group.group_mod_demote', defaultMessage: 'Remove {role} role' },
  groupModKick: { id: 'group.group_mod_kick', defaultMessage: 'Kick @{name} from group' },
  groupModPromoteAdmin: { id: 'group.group_mod_promote_admin', defaultMessage: 'Promote @{name} to group administrator' },
  groupModPromoteMod: { id: 'group.group_mod_promote_mod', defaultMessage: 'Assign {role} role' },
  kickConfirm: { id: 'confirmations.kick_from_group.confirm', defaultMessage: 'Kick' },
  kickFromGroupMessage: { id: 'confirmations.kick_from_group.message', defaultMessage: 'Are you sure you want to kick @{name} from this group?' },
  kicked: { id: 'group.group_mod_kick.success', defaultMessage: 'Kicked @{name} from group' },
  promoteConfirm: { id: 'confirmations.promote_in_group.confirm', defaultMessage: 'Promote' },
  promoteConfirmMessage: { id: 'confirmations.promote_in_group.message', defaultMessage: 'Are you sure you want to promote @{name}? You will not be able to demote them.' },
  promotedToAdmin: { id: 'group.group_mod_promote_admin.success', defaultMessage: 'Promoted @{name} to group administrator' },
  promotedToMod: { id: 'group.group_mod_promote_mod.success', defaultMessage: 'You have successfully promoted @{name} to group {role}.' },
});

interface IGroupMemberListItem {
  member: GroupMember
  group: Group
}

const GroupMemberListItem = (props: IGroupMemberListItem) => {
  const { member, group } = props;

  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const { roles, isAdminRole, normalizeRole } = useGroupRoles();
  const blockGroupMember = useBlockGroupMember(group, member);
  const promoteGroupMember = usePromoteGroupMember(group, member);
  const demoteGroupMember = useDemoteGroupMember(group, member);

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
      heading: intl.formatMessage(messages.blockFromGroupHeading),
      message: intl.formatMessage(messages.blockFromGroupMessage, { name: account.username }),
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => {
        blockGroupMember({ account_ids: [member.account.id] }, {
          onSuccess() {
            dispatch(deleteEntities([member.id], Entities.GROUP_MEMBERSHIPS));
            toast.success(intl.formatMessage(messages.blocked, { name: account.acct }));
          },
        });
      },
    }));
  };

  const onPromote = (role: TruthSocialGroupRoles | BaseGroupRoles, warning?: boolean) => {
    if (warning) {
      return dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(messages.promoteConfirmMessage, { name: account.username }),
        confirm: intl.formatMessage(messages.promoteConfirm),
        onConfirm: () => {
          promoteGroupMember({ role: role, account_ids: [account.id] }, {
            onSuccess() {
              toast.success(
                intl.formatMessage(
                  isAdminRole(role) ? messages.promotedToAdmin : messages.promotedToMod, { name: account.acct, role },
                ),
              );
            },
          });
        },
      }));
    } else {
      promoteGroupMember({ role: role, account_ids: [account.id] }, {
        onSuccess() {
          toast.success(
            intl.formatMessage(
              isAdminRole(role) ? messages.promotedToAdmin : messages.promotedToMod, { name: account.acct, role },
            ),
          );
        },
      });
    }
  };

  const handlePromoteToGroupAdmin = () => onPromote(roles.admin, true);

  const handleAssignModerator = () => {
    onPromote(roles.moderator, false);
  };

  const handleDemote = () => {
    demoteGroupMember({ role: roles.user, account_ids: [account.id] }, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.demotedToUser, { name: account.acct }));
      },
    });
  };

  const menu: IMenu = useMemo(() => {
    const items: IMenu = [];

    if (!group || !account || !group.relationship?.role) {
      return items;
    }

    if (isCurrentUserAdmin && !isMemberAdmin && account.acct === account.username) {
      if (isMemberModerator) {
        if (features.groupsPromoteToAdmin) {
          items.push({
            text: intl.formatMessage(messages.groupModPromoteAdmin, { name: account.username }),
            icon: require('@tabler/icons/arrow-up-circle.svg'),
            action: handlePromoteToGroupAdmin,
          });
        }

        items.push({
          text: intl.formatMessage(messages.groupModDemote, { role: roles.moderator, name: account.username }),
          icon: require('@tabler/icons/briefcase.svg'),
          action: handleDemote,
          destructive: true,
        });
      } else if (isMemberUser) {
        items.push({
          text: intl.formatMessage(messages.groupModPromoteMod, { role: roles.moderator }),
          icon: require('@tabler/icons/briefcase.svg'),
          action: handleAssignModerator,
        });
      }
    }

    if (
      (isCurrentUserAdmin || isCurrentUserModerator) &&
      (isMemberModerator || isMemberUser) &&
      member.role !== group.relationship.role
    ) {
      if (features.groupsKick) {
        items.push({
          text: intl.formatMessage(messages.groupModKick, { name: account.username }),
          icon: require('@tabler/icons/user-minus.svg'),
          action: handleKickFromGroup,
        });
      }

      items.push({
        text: intl.formatMessage(messages.groupModBlock, { name: account.username }),
        icon: require('@tabler/icons/ban.svg'),
        action: handleBlockFromGroup,
        destructive: true,
      });
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

        <DropdownMenu items={menu} />
      </HStack>
    </HStack>
  );
};

export default GroupMemberListItem;