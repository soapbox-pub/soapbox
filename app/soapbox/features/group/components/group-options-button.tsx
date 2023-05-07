import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { initReport, ReportableEntities } from 'soapbox/actions/reports';
import { useLeaveGroup } from 'soapbox/api/hooks';
import DropdownMenu, { Menu } from 'soapbox/components/dropdown-menu';
import { IconButton } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';
import toast from 'soapbox/toast';

import type { Account, Group } from 'soapbox/types/entities';

const messages = defineMessages({
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  leave: { id: 'group.leave.label', defaultMessage: 'Leave' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
  report: { id: 'group.report.label', defaultMessage: 'Report' },
});

interface IGroupActionButton {
  group: Group
}

const GroupOptionsButton = ({ group }: IGroupActionButton) => {
  const account = useOwnAccount();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const leaveGroup = useLeaveGroup(group);

  const isMember = group.relationship?.role === GroupRoles.USER;
  const isAdmin = group.relationship?.role === GroupRoles.ADMIN;
  const isBlocked = group.relationship?.blocked_by;

  const onLeaveGroup = () =>
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
    const items = [];

    if (isMember || isAdmin) {
      items.push({
        text: intl.formatMessage(messages.report),
        icon: require('@tabler/icons/flag.svg'),
        action: () => dispatch(initReport(ReportableEntities.GROUP, account as Account, { group })),
      });
    }

    if (isAdmin) {
      items.push({
        text: intl.formatMessage(messages.leave),
        icon: require('@tabler/icons/logout.svg'),
        action: onLeaveGroup,
      });
    }

    return items;
  }, [isMember, isAdmin]);

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