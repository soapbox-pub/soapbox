import clsx from 'clsx';
import React from 'react';

import Account from 'soapbox/components/account';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs';
import StatusContent from 'soapbox/components/status-content';
import StatusReplyMentions from 'soapbox/components/status-reply-mentions';
import { HStack } from 'soapbox/components/ui';
import PollPreview from 'soapbox/features/ui/components/poll-preview';
import { useAppSelector } from 'soapbox/hooks';

import { buildStatus } from '../builder';

import ScheduledStatusActionBar from './scheduled-status-action-bar';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

interface IScheduledStatus {
  statusId: string
}

const ScheduledStatus: React.FC<IScheduledStatus> = ({ statusId, ...other }) => {
  const status = useAppSelector((state) => {
    const scheduledStatus = state.scheduled_statuses.get(statusId);
    if (!scheduledStatus) return null;
    return buildStatus(state, scheduledStatus);
  }) as StatusEntity | null;

  if (!status) return null;

  const account = status.account as AccountEntity;

  return (
    <div className={clsx('status__wrapper', `status__wrapper-${status.visibility}`, { 'status__wrapper-reply': !!status.in_reply_to_id })} tabIndex={0}>
      <div className={clsx('status', `status-${status.visibility}`, { 'status-reply': !!status.in_reply_to_id })} data-id={status.id}>
        <div className='mb-4'>
          <HStack justifyContent='between' alignItems='start'>
            <Account
              key={account.id}
              account={account}
              timestamp={status.created_at}
              futureTimestamp
              hideActions
            />
          </HStack>
        </div>

        <StatusReplyMentions status={status} />

        <StatusContent
          status={status}
          collapsable
        />

        {status.media_attachments.size > 0 && (
          <AttachmentThumbs
            media={status.media_attachments}
            sensitive={status.sensitive}
          />
        )}

        {status.poll && <PollPreview pollId={status.poll as string} />}

        <ScheduledStatusActionBar status={status} {...other} />
      </div>
    </div>
  );
};

export default ScheduledStatus;
