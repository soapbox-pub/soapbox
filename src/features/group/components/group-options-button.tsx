import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { initReport, ReportableEntities } from 'soapbox/actions/reports';
import { useLeaveGroup, useMuteGroup, useUnmuteGroup } from 'soapbox/api/hooks';
import DropdownMenu, { Menu } from 'soapbox/components/dropdown-menu';
import { IconButton } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';

import type { Account, Group } from 'soapbox/types/entities';

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave Group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  muteConfirm: { id: 'confirmations.mute_group.confirm', defaultMessage: 'Mute' },
  muteHeading: { id: 'confirmations.mute_group.heading', defaultMessage: 'Mute Group' },
  muteMessage: { id: 'confirmations.mute_group.message', defaultMessage: 'You are about to mute the group. Do you want to continue?' },
  muteSuccess: { id: 'group.mute.success', defaultMessage: 'Muted the group' },
  unmuteSuccess: { id: 'group.unmute.success', defaultMessage: 'Unmuted the group' },
  leave: { id: 'group.leave.label', defaultMessage: 'Leave' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
  mute: { id: 'group.mute.label', defaultMessage: 'Mute' },
  unmute: { id: 'group.unmute.label', defaultMessage: 'Unmute' },
  report: { id: 'group.report.label', defaultMessage: 'Report' },
  share: { id: 'group.share.label', defaultMessage: 'Share' },
});

interface IGroupActionButton {
  group: Group
}

const GroupOptionsButton = ({ group }: IGroupActionButton) => {
  const { account } = useOwnAccount();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const muteGroup = useMuteGroup(group);
  const unmuteGroup = useUnmuteGroup(group);
  const leaveGroup = useLeaveGroup(group);

  const isMember = group.relationship?.role === GroupRoles.USER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;
  const isInGroup = !!group.relationship?.member;
  const isBlocked = group.relationship?.blocked_by;
  const isMuting = group.relationship?.muting;

  const handleShare = () => {
    navigator.share({
      text: group.display_name,
      url: group.url,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  const handleMute = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.muteHeading),
      message: intl.formatMessage(messages.muteMessage),
      confirm: intl.formatMessage(messages.muteConfirm),
      confirmationTheme: 'primary',
      onConfirm: () => muteGroup.mutate(undefined, {
        onSuccess() {
          toast.success(intl.formatMessage(messages.muteSuccess));
        },
      }),
    }));

  const handleUnmute = () => {
    unmuteGroup.mutate(undefined, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.unmuteSuccess));
      },
    });
  };

  const handleLeave = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => leaveGroup.mutate(group.relationship?.id as string, {
        onSuccess() {
          leaveGroup.invalidate();
          toast.success(intl.formatMessage(messages.leaveSuccess));
        },
      }),
    }));

  const menu: Menu = useMemo(() => {
    const canShare = 'share' in navigator;
    const items = [];

    if (canShare) {
      items.push({
        text: intl.formatMessage(messages.share),
        icon: require('@tabler/icons/share.svg'),
        action: handleShare,
      });
    }

    if (isInGroup) {
      items.push({
        text: isMuting ? intl.formatMessage(messages.unmute) : intl.formatMessage(messages.mute),
        icon: require('@tabler/icons/volume-3.svg'),
        action: isMuting ? handleUnmute : handleMute,
      });
    }

    if (isMember || isAdmin) {
      items.push({
        text: intl.formatMessage(messages.report),
        icon: require('@tabler/icons/flag.svg'),
        action: () => dispatch(initReport(ReportableEntities.GROUP, account as Account, { group })),
      });
    }

    if (isAdmin) {
      items.push(null);
      items.push({
        text: intl.formatMessage(messages.leave),
        icon: require('@tabler/icons/logout.svg'),
        action: handleLeave,
      });
    }

    return items;
  }, [isMember, isAdmin, isInGroup, isMuting]);

  if (isBlocked || menu.length === 0) {
    return null;
  }

  return (
    <DropdownMenu items={menu} placement='bottom'>
      <IconButton
        src={require('@tabler/icons/dots.svg')}
        theme='secondary'
        iconClassName='h-5 w-5'
        className='self-stretch px-2.5'
        data-testid='dropdown-menu-button'
      />
    </DropdownMenu>
  );
};

export default GroupOptionsButton;