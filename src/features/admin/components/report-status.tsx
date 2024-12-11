import dotsVerticalIcon from '@tabler/icons/outline/dots-vertical.svg';
import pencilIcon from '@tabler/icons/outline/pencil.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import { useIntl, defineMessages } from 'react-intl';

import { deleteStatusModal } from 'soapbox/actions/moderation.tsx';
import DropdownMenu from 'soapbox/components/dropdown-menu/index.ts';
import StatusContent from 'soapbox/components/status-content.tsx';
import StatusMedia from 'soapbox/components/status-media.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { Status as StatusEntity } from 'soapbox/schemas/index.ts';

import type { AdminReport, Status as LegacyStatus } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  viewStatus: { id: 'admin.reports.actions.view_status', defaultMessage: 'View post' },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
});

interface IReportStatus {
  status: LegacyStatus;
  report?: AdminReport;
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
      icon: pencilIcon,
    }, {
      text: intl.formatMessage(messages.deleteStatus, { acct: `@${acct}` }),
      action: handleDeleteStatus,
      icon: trashIcon,
      destructive: true,
    }];
  };

  const menu = makeMenu();

  return (
    <HStack space={2} alignItems='start'>
      <Stack space={2} className='overflow-hidden' grow>
        <StatusContent status={status} />
        <StatusMedia status={status.toJS() as StatusEntity}  />
      </Stack>

      <div className='flex-none'>
        <DropdownMenu
          items={menu}
          src={dotsVerticalIcon}
        />
      </div>
    </HStack>
  );
};

export default ReportStatus;
