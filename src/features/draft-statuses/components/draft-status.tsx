import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs';
import StatusContent from 'soapbox/components/status-content';
import StatusReplyMentions from 'soapbox/components/status-reply-mentions';
import { HStack, Stack } from 'soapbox/components/ui';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';
import PollPreview from 'soapbox/features/ui/components/poll-preview';
import { useAppSelector } from 'soapbox/hooks';

import { buildStatus } from '../builder';

import DraftStatusActionBar from './draft-status-action-bar';

import type { DraftStatus as DraftStatusType } from 'soapbox/reducers/draft-statuses';
import type { Poll as PollEntity, Status as StatusEntity } from 'soapbox/types/entities';

interface IDraftStatus {
  draftStatus: DraftStatusType;
}

const DraftStatus: React.FC<IDraftStatus> = ({ draftStatus, ...other }) => {
  const status = useAppSelector((state) => {
    if (!draftStatus) return null;
    return buildStatus(state, draftStatus);
  }) as StatusEntity | null;

  if (!status) return null;

  const account = status.account;

  let quote;

  if (status.quote) {
    if (status.pleroma.get('quote_visible', true) === false) {
      quote = (
        <div className='quoted-status-tombstone'>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={status.quote as string} />;
    }
  }

  return (
    <div className={clsx('status__wrapper py-4', `status__wrapper-${status.visibility}`, { 'status__wrapper-reply': !!status.in_reply_to_id })} tabIndex={0}>
      <div className={clsx('status', `status-${status.visibility}`, { 'status-reply': !!status.in_reply_to_id })} data-id={status.id}>
        <div className='mb-4'>
          <HStack justifyContent='between' alignItems='start'>
            <Account
              key={account.id}
              account={account}
              timestamp={status.created_at}
              futureTimestamp
              action={<DraftStatusActionBar source={draftStatus} status={status} {...other} />}
            />
          </HStack>
        </div>

        <StatusReplyMentions status={status} />

        <Stack space={4}>
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

          {quote}

          {status.poll && <PollPreview poll={status.poll as PollEntity} />}
        </Stack>
      </div>
    </div>
  );
};

export default DraftStatus;
