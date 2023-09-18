import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import { expandAccountMediaTimeline } from 'soapbox/actions/timelines';
import { useAccountLookup } from 'soapbox/api/hooks';
import LoadMore from 'soapbox/components/load-more';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Column, Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { getAccountGallery } from 'soapbox/selectors';

import MediaItem from './components/media-item';

import type { List as ImmutableList } from 'immutable';
import type { Attachment, Status } from 'soapbox/types/entities';

interface ILoadMoreMedia {
  maxId: string | null
  onLoadMore: (value: string | null) => void
}

const LoadMoreMedia: React.FC<ILoadMoreMedia> = ({ maxId, onLoadMore }) => {
  const handleLoadMore = () => {
    onLoadMore(maxId);
  };

  return (
    <LoadMore onClick={handleLoadMore} />
  );
};

const AccountGallery = () => {
  const dispatch = useAppDispatch();
  const { username } = useParams<{ username: string }>();

  const {
    account,
    isLoading: accountLoading,
    isUnavailable,
  } = useAccountLookup(username, { withRelationship: true });

  const attachments: ImmutableList<Attachment> = useAppSelector((state) => getAccountGallery(state, account!.id));
  const isLoading = useAppSelector((state) => state.timelines.get(`account:${account?.id}:media`)?.isLoading);
  const hasMore = useAppSelector((state) => state.timelines.get(`account:${account?.id}:media`)?.hasMore);
  const next = useAppSelector(state => state.timelines.get(`account:${account?.id}:media`)?.next);

  const node = useRef<HTMLDivElement>(null);

  const handleScrollToBottom = () => {
    if (hasMore) {
      handleLoadMore(attachments.size > 0 ? attachments.last()!.status.id : undefined);
    }
  };

  const handleLoadMore = (maxId: string | null) => {
    if (account) {
      dispatch(expandAccountMediaTimeline(account.id, { url: next, maxId }));
    }
  };

  const handleLoadOlder: React.MouseEventHandler = e => {
    e.preventDefault();
    handleScrollToBottom();
  };

  const handleOpenMedia = (attachment: Attachment) => {
    if (attachment.type === 'video') {
      dispatch(openModal('VIDEO', { media: attachment, status: attachment.status, account: attachment.account }));
    } else {
      const media = (attachment.status as Status).media_attachments;
      const index = media.findIndex((x) => x.id === attachment.id);

      dispatch(openModal('MEDIA', { media, index, status: attachment.status }));
    }
  };

  useEffect(() => {
    if (account) {
      dispatch(expandAccountMediaTimeline(account.id));
    }
  }, [account?.id]);

  if (accountLoading || (!attachments && isLoading)) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  let loadOlder = null;

  if (hasMore && !(isLoading && attachments.size === 0)) {
    loadOlder = <LoadMore className='my-auto' visible={!isLoading} onClick={handleLoadOlder} />;
  }

  if (isUnavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  return (
    <Column label={`@${account.acct}`} transparent withHeader={false}>
      <div role='feed' className='grid grid-cols-2 gap-2 sm:grid-cols-3' ref={node}>
        {attachments.map((attachment, index) => attachment === null ? (
          <LoadMoreMedia key={'more:' + attachments.get(index + 1)?.id} maxId={index > 0 ? (attachments.get(index - 1)?.id || null) : null} onLoadMore={handleLoadMore} />
        ) : (
          <MediaItem
            key={`${attachment.status.id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
          />
        ))}

        {!isLoading && attachments.size === 0 && (
          <div className='empty-column-indicator col-span-2 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}

        {loadOlder}
      </div>

      {isLoading && attachments.size === 0 && (
        <div className='slist__append'>
          <Spinner />
        </div>
      )}
    </Column>
  );
};

export default AccountGallery;
