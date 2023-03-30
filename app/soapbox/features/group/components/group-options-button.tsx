import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { initReport, ReportableEntities } from 'soapbox/actions/reports';
import DropdownMenu, { Menu } from 'soapbox/components/dropdown-menu';
import { IconButton } from 'soapbox/components/ui';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';

import type { Account, Group } from 'soapbox/types/entities';

const messages = defineMessages({
  report: { id: 'group.report.label', defaultMessage: 'Report' },
});

interface IGroupActionButton {
  group: Group
}

const GroupOptionsButton = ({ group }: IGroupActionButton) => {
  const account = useOwnAccount();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const isMember = group.relationship?.role === GroupRoles.USER;
  const isBlocked = group.relationship?.blocked_by;

  const menu: Menu = useMemo(() => ([
    {
      text: intl.formatMessage(messages.report),
      icon: require('@tabler/icons/flag.svg'),
      action: () => dispatch(initReport(ReportableEntities.GROUP, account as Account, { group })),
    },
  ]), []);

  if (isBlocked || !isMember || menu.length === 0) {
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