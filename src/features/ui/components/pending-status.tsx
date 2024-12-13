import clsx from 'clsx';

import Account from 'soapbox/components/account.tsx';
import StatusContent from 'soapbox/components/status-content.tsx';
import StatusReplyMentions from 'soapbox/components/status-reply-mentions.tsx';
import { Card } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import PlaceholderCard from 'soapbox/features/placeholder/components/placeholder-card.tsx';
import PlaceholderMediaGallery from 'soapbox/features/placeholder/components/placeholder-media-gallery.tsx';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import { buildStatus } from '../util/pending-status-builder.ts';

import PollPreview from './poll-preview.tsx';

import type { Status as StatusEntity } from 'soapbox/types/entities.ts';

const shouldHaveCard = (pendingStatus: StatusEntity) => {
  return Boolean(pendingStatus.content.match(/https?:\/\/\S*/));
};

interface IPendingStatus {
  className?: string;
  idempotencyKey: string;
  muted?: boolean;
  thread?: boolean;
}

interface IPendingStatusMedia {
  status: StatusEntity;
}

const PendingStatusMedia: React.FC<IPendingStatusMedia> = ({ status }) => {
  if (status.media_attachments && status.media_attachments.length > 0) {
    return (
      <PlaceholderMediaGallery
        media={status.media_attachments}
      />
    );
  } else if (!status.quote && shouldHaveCard(status)) {
    return <PlaceholderCard />;
  } else {
    return null;
  }
};

const PendingStatus: React.FC<IPendingStatus> = ({ idempotencyKey, className, muted, thread = false }) => {
  const status = useAppSelector((state) => {
    const pendingStatus = state.pending_statuses.get(idempotencyKey);
    return pendingStatus ? buildStatus(state, pendingStatus, idempotencyKey) : null;
  }) as StatusEntity | null;

  if (!status) return null;
  if (!status.account) return null;

  const account = status.account;

  return (
    <div className={clsx('opacity-50', className)}>
      <div className={clsx('status', { 'status-reply': !!status.in_reply_to_id, muted })} data-id={status.id}>
        <Card
          className={clsx({
            'py-6 sm:p-5': !thread,
            'status-reply': !!status.in_reply_to_id,
          })}
          variant={thread ? 'default' : 'rounded'}
        >
          <div className='mb-4'>
            <HStack justifyContent='between' alignItems='start'>
              <Account
                key={account.id}
                account={account}
                timestamp={status.created_at}
                hideActions
                withLinkToProfile={false}
              />
            </HStack>
          </div>

          <div className='status--content-wrapper'>
            <StatusReplyMentions status={status} />

            <Stack space={4}>
              <StatusContent
                status={status}
                collapsable
              />

              <PendingStatusMedia status={status} />

              {status.poll && <PollPreview pollId={status.poll as string} />}

              {status.quote && <QuotedStatus statusId={status.quote as string} />}
            </Stack>
          </div>

          {/* TODO */}
          {/* <PlaceholderActionBar /> */}
        </Card>
      </div>
    </div>
  );
};

export default PendingStatus;
