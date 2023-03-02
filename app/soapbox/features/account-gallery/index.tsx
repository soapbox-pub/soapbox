import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import {
  fetchAccount,
  fetchAccountByUsername,
} from 'soapbox/actions/accounts';
import { openModal } from 'soapbox/actions/modals';
import { expandAccountMediaTimeline } from 'soapbox/actions/timelines';
import LoadMore from 'soapbox/components/load-more';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Column, Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { getAccountGallery, findAccountByUsername } from 'soapbox/selectors';

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
  const features = useFeatures();

  const { accountId, unavailable, accountUsername } = useAppSelector((state) => {
    const me = state.me;
    const accountFetchError = (state.accounts.get(-1)?.username || '').toLowerCase() === username.toLowerCase();

    let accountId: string | -1 | null = -1;
    let accountUsername = username;
    if (accountFetchError) {
      accountId = null;
    } else {
      const account = findAccountByUsername(state, username);
      accountId = account ? (account.id || null) : -1;
      accountUsername = account?.acct || '';
    }

    const isBlocked = state.relationships.get(String(accountId))?.blocked_by || false;
    return {
      accountId,
      unavailable: (me === accountId) ? false : (isBlocked && !features.blockersVisible),
      accountUsername,
    };
  });
  const isAccount = useAppSelector((state) => !!state.accounts.get(accountId));
  const attachments: ImmutableList<Attachment> = useAppSelector((state) => getAccountGallery(state, accountId as string));
  const isLoading = useAppSelector((state) => state.timelines.get(`account:${accountId}:media`)?.isLoading);
  const hasMore = useAppSelector((state) => state.timelines.get(`account:${accountId}:media`)?.hasMore);

  const node = useRef<HTMLDivElement>(null);

  const handleScrollToBottom = () => {
    if (hasMore) {
      handleLoadMore(attachments.size > 0 ? attachments.last()!.status.id : undefined);
    }
  };

  const handleLoadMore = (maxId: string | null) => {
    if (accountId && accountId !== -1) {
      dispatch(expandAccountMediaTimeline(accountId, { maxId }));
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
    if (accountId && accountId !== -1) {
      dispatch(fetchAccount(accountId));
      dispatch(expandAccountMediaTimeline(accountId));
    } else {
      dispatch(fetchAccountByUsername(username));
    }
  }, [accountId]);

  if (!isAccount && accountId !== -1) {
    return (
      <MissingIndicator />
    );
  }

  if (accountId === -1 || (!attachments && isLoading)) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  let loadOlder = null;

  if (hasMore && !(isLoading && attachments.size === 0)) {
    loadOlder = <LoadMore visible={!isLoading} onClick={handleLoadOlder} />;
  }

  if (unavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  return (
    <Column label={`@${accountUsername}`} transparent withHeader={false}>
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
          <div className='empty-column-indicator'>
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
