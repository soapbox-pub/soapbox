import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { deleteStatusModal } from 'soapbox/actions/moderation';
import DropdownMenu from 'soapbox/components/dropdown-menu';
import StatusContent from 'soapbox/components/status-content';
import StatusMedia from 'soapbox/components/status-media';
import { HStack, Stack } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { AdminReport, Status } from 'soapbox/types/entities';

const messages = defineMessages({
  viewStatus: { id: 'admin.reports.actions.view_status', defaultMessage: 'View post' },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
});

interface IReportStatus {
  status: Status
  report?: AdminReport
}

const ReportStatus: React.FC<IReportStatus> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleDeleteStatus = () => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const makeMenu = () => {
    const acct = status.getIn(['account', 'acct']);

    return [{
      text: intl.formatMessage(messages.viewStatus, { acct: `@${acct}` }),
      to: `/@${acct}/posts/${status.id}`,
      icon: require('@tabler/icons/pencil.svg'),
    }, {
      text: intl.formatMessage(messages.deleteStatus, { acct: `@${acct}` }),
      action: handleDeleteStatus,
      icon: require('@tabler/icons/trash.svg'),
      destructive: true,
    }];
  };

  const menu = makeMenu();

  return (
    <HStack space={2} alignItems='start'>
      <Stack space={2} className='overflow-hidden' grow>
        <StatusContent status={status} />
        <StatusMedia status={status} />
      </Stack>

      <div className='flex-none'>
        <DropdownMenu
          items={menu}
          src={require('@tabler/icons/dots-vertical.svg')}
        />
      </div>
    </HStack>
  );
};

export default ReportStatus;
