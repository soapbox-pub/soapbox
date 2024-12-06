import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';

import AttachmentThumbs from 'soapbox/components/attachment-thumbs.tsx';
import Markup from 'soapbox/components/markup.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { getTextDirection } from 'soapbox/utils/rtl.ts';

import type { Status } from 'soapbox/types/entities.ts';

interface IReplyIndicator {
  className?: string;
  status?: Status;
  onCancel?: () => void;
  hideActions: boolean;
}

const ReplyIndicator: React.FC<IReplyIndicator> = ({ className, status, hideActions, onCancel }) => {
  const handleClick = () => {
    onCancel!();
  };

  if (!status) {
    return null;
  }

  let actions = {};
  if (!hideActions && onCancel) {
    actions = {
      onActionClick: handleClick,
      actionIcon: xIcon,
      actionAlignment: 'top',
      actionTitle: 'Dismiss',
    };
  }

  return (
    <Stack space={2} className={clsx('max-h-72 overflow-y-auto rounded-lg bg-gray-100 p-4 black:bg-gray-900 dark:bg-gray-800', className)}>
      <AccountContainer
        {...actions}
        id={status.account.id}
        timestamp={status.created_at}
        showProfileHoverCard={false}
        withLinkToProfile={false}
        hideActions={hideActions}
      />

      <Markup
        className='break-words'
        size='sm'
        direction={getTextDirection(status.search_index)}
        emojis={status?.emojis?.toJS() ?? status.emojis} // Use toJS() if status.emojis is immutable; otherwise, fallback to plain status.emojis
        mentions={status.mentions.toJS()}
        html={{ __html: status.content }}
      />

      {status.media_attachments.size > 0 && (
        <AttachmentThumbs
          media={status.media_attachments}
          sensitive={status.sensitive}
        />
      )}
    </Stack>
  );
};

export default ReplyIndicator;
