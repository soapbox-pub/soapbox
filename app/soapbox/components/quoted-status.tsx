import classNames from 'clsx';
import React, { MouseEventHandler, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import StatusMedia from 'soapbox/components/status-media';
import { Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account_container';
import { useSettings } from 'soapbox/hooks';
import { defaultMediaVisibility } from 'soapbox/utils/status';

import OutlineBox from './outline-box';
import StatusReplyMentions from './status-reply-mentions';
import StatusContent from './status_content';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

interface IQuotedStatus {
  /** The quoted status entity. */
  status?: StatusEntity,
  /** Callback when cancelled (during compose). */
  onCancel?: Function,
  /** Whether the status is shown in the post composer. */
  compose?: boolean,
}

/** Status embedded in a quote post. */
const QuotedStatus: React.FC<IQuotedStatus> = ({ status, onCancel, compose }) => {
  const intl = useIntl();
  const history = useHistory();

  const settings = useSettings();
  const displayMedia = settings.get('displayMedia');

  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));

  const handleExpandClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!status) return;
    const account = status.account as AccountEntity;

    if (!compose && e.button === 0) {
      history.push(`/@${account.acct}/posts/${status.id}`);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleToggleMediaVisibility = () => {
    setShowMedia(!showMedia);
  };

  if (!status) {
    return null;
  }

  const account = status.account as AccountEntity;

  let actions = {};
  if (onCancel) {
    actions = {
      onActionClick: handleClose,
      actionIcon: require('@tabler/icons/x.svg'),
      actionAlignment: 'top',
      actionTitle: intl.formatMessage(messages.cancel),
    };
  }

  return (
    <OutlineBox
      data-testid='quoted-status'
      className={classNames('cursor-pointer', {
        'hover:bg-gray-100 dark:hover:bg-gray-800': !compose,
      })}
    >
      <Stack
        space={2}
        onClick={handleExpandClick}
      >
        <AccountContainer
          {...actions}
          id={account.id}
          timestamp={status.created_at}
          withRelationship={false}
          showProfileHoverCard={!compose}
          withLinkToProfile={!compose}
        />

        <StatusReplyMentions status={status} hoverable={false} />

        <Stack className={classNames('relative', {
          'min-h-[220px]': status.hidden,
        })}
        >
          {(status.hidden) && (
            <SensitiveContentOverlay
              status={status}
              visible={showMedia}
              onToggleVisibility={handleToggleMediaVisibility}
            />
          )}

          <Stack space={4}>
            <StatusContent
              status={status}
              collapsable
            />

            {(status.card || status.media_attachments.size > 0) && (
              <StatusMedia
                status={status}
                muted={compose}
                showMedia={showMedia}
                onToggleVisibility={handleToggleMediaVisibility}
              />
            )}
          </Stack>
        </Stack>
      </Stack>
    </OutlineBox>
  );
};

export default QuotedStatus;
