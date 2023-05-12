import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HotKeys } from 'react-hotkeys';
import { defineMessages, useIntl } from 'react-intl';
import { Redirect, useHistory } from 'react-router-dom';

import {
  replyCompose,
  mentionCompose,
} from 'soapbox/actions/compose';
import {
  favourite,
  unfavourite,
  reblog,
  unreblog,
} from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { getSettings } from 'soapbox/actions/settings';
import { useStatus } from 'soapbox/api/hooks/statuses/useStatus';
import { useStatusAncestors } from 'soapbox/api/hooks/statuses/useStatusAncestors';
import { useStatusDescendants } from 'soapbox/api/hooks/statuses/useStatusDescendants';
import MissingIndicator from 'soapbox/components/missing-indicator';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import ScrollableList from 'soapbox/components/scrollable-list';
import StatusActionBar from 'soapbox/components/status-action-bar';
import Tombstone from 'soapbox/components/tombstone';
import { Column, Stack } from 'soapbox/components/ui';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import PendingStatus from 'soapbox/features/ui/components/pending-status';
import { useAppDispatch, useAppSelector, useSettings } from 'soapbox/hooks';
import { normalizeStatus } from 'soapbox/normalizers';
import { defaultMediaVisibility } from 'soapbox/utils/status';

import DetailedStatus from './components/detailed-status';
import ThreadLoginCta from './components/thread-login-cta';
import ThreadStatus from './components/thread-status';

import type { VirtuosoHandle } from 'react-virtuoso';
import type {
  Account as AccountEntity,
  Attachment as AttachmentEntity,
  Status as StatusEntity,
} from 'soapbox/schemas';

const messages = defineMessages({
  title: { id: 'status.title', defaultMessage: 'Post Details' },
  titleDirect: { id: 'status.title_direct', defaultMessage: 'Direct message' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this post and re-draft it? Favorites and reposts will be lost, and replies to the original post will be orphaned.' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  revealAll: { id: 'status.show_more_all', defaultMessage: 'Show more for all' },
  hideAll: { id: 'status.show_less_all', defaultMessage: 'Show less for all' },
  detailedStatus: { id: 'status.detailed_status', defaultMessage: 'Detailed conversation view' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
});

type DisplayMedia = 'default' | 'hide_all' | 'show_all';

type RouteParams = {
  statusId: string
  groupId?: string
  groupSlug?: string
};

interface IThread {
  params: RouteParams
  onOpenMedia: (media: AttachmentEntity[], index: number) => void
  onOpenVideo: (video: AttachmentEntity, time: number) => void
}

const Thread: React.FC<IThread> = (props) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const statusId = props.params.statusId;

  const { status, isLoading: isStatusLoading } = useStatus(statusId);
  const { statuses: ancestors, isLoading: isAncestorsLoading } = useStatusAncestors(statusId);
  const { statuses: descendants, isLoading: isDescendantsLoading, hasNextPage, fetchNextPage } = useStatusDescendants(statusId);

  const ancestorsIds = ancestors.map(status => status.id);
  const descendantsIds = descendants.map(status => status.id);

  const me = useAppSelector(state => state.me);
  const displayMedia = settings.get('displayMedia') as DisplayMedia;
  const isUnderReview = status?.visibility === 'self';
  const isLoaded = !isStatusLoading && !isAncestorsLoading && !isDescendantsLoading;

  const [showMedia, setShowMedia] = useState<boolean>(status?.visibility === 'self' ? false : defaultMediaVisibility(status as any, displayMedia));

  const node = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle>(null);

  const handleToggleMediaVisibility = () => {
    setShowMedia(!showMedia);
  };

  const handleHotkeyReact = () => {
    if (statusRef.current) {
      const firstEmoji: HTMLButtonElement | null = statusRef.current.querySelector('.emoji-react-selector .emoji-react-selector__emoji');
      firstEmoji?.focus();
    }
  };

  const handleFavouriteClick = (status: StatusEntity) => {
    if (status.favourited) {
      dispatch(unfavourite(status as any));
    } else {
      dispatch(favourite(status as any));
    }
  };

  const handleReplyClick = (status: StatusEntity) => {
    dispatch(replyCompose(status as any));
  };

  const handleModalReblog = (status: StatusEntity) => {
    dispatch(reblog(status as any));
  };

  const handleReblogClick = (status: StatusEntity, e?: React.MouseEvent) => {
    dispatch((_, getState) => {
      const boostModal = getSettings(getState()).get('boostModal');
      if (status.reblogged) {
        dispatch(unreblog(status as any));
      } else {
        if ((e && e.shiftKey) || !boostModal) {
          handleModalReblog(status);
        } else {
          dispatch(openModal('BOOST', { status, onReblog: handleModalReblog }));
        }
      }
    });
  };

  const handleMentionClick = (account: AccountEntity) => {
    dispatch(mentionCompose(account as any));
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent) => {
    const { onOpenMedia, onOpenVideo } = props;
    const firstAttachment = status?.media_attachments?.[0];

    e?.preventDefault();

    if (status && firstAttachment) {
      if (firstAttachment.type === 'video') {
        onOpenVideo(firstAttachment, 0);
      } else {
        onOpenMedia(status.media_attachments, 0);
      }
    }
  };

  // const handleToggleHidden = (status: StatusEntity) => {
  //   if (status.hidden) {
  //     dispatch(revealStatus(status.id));
  //   } else {
  //     dispatch(hideStatus(status.id));
  //   }
  // };

  const handleHotkeyMoveUp = () => {
    handleMoveUp(status!.id);
  };

  const handleHotkeyMoveDown = () => {
    handleMoveDown(status!.id);
  };

  const handleHotkeyReply = (e?: KeyboardEvent) => {
    e?.preventDefault();
    handleReplyClick(status!);
  };

  const handleHotkeyFavourite = () => {
    handleFavouriteClick(status!);
  };

  const handleHotkeyBoost = () => {
    handleReblogClick(status!);
  };

  const handleHotkeyMention = (e?: KeyboardEvent) => {
    e?.preventDefault();
    const { account } = status!;
    if (!account || typeof account !== 'object') return;
    handleMentionClick(account);
  };

  const handleHotkeyOpenProfile = () => {
    history.push(`/@${status!.account.acct}`);
  };

  const handleHotkeyToggleHidden = () => {
    // handleToggleHidden(status!);
  };

  const handleHotkeyToggleSensitive = () => {
    handleToggleMediaVisibility();
  };

  const handleMoveUp = (id: string) => {
    if (id === status?.id) {
      _selectChild(ancestorsIds.length - 1);
    } else {
      let index = ImmutableList(ancestorsIds).indexOf(id);

      if (index === -1) {
        index = ImmutableList(descendantsIds).indexOf(id);
        _selectChild(ancestorsIds.length + index);
      } else {
        _selectChild(index - 1);
      }
    }
  };

  const handleMoveDown = (id: string) => {
    if (id === status?.id) {
      _selectChild(ancestorsIds.length + 1);
    } else {
      let index = ImmutableList(ancestorsIds).indexOf(id);

      if (index === -1) {
        index = ImmutableList(descendantsIds).indexOf(id);
        _selectChild(ancestorsIds.length + index + 2);
      } else {
        _selectChild(index + 1);
      }
    }
  };

  const _selectChild = (index: number) => {
    scroller.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        const element = document.querySelector<HTMLDivElement>(`#thread [data-index="${index}"] .focusable`);

        if (element) {
          element.focus();
        }
      },
    });
  };

  const renderTombstone = (id: string) => {
    return (
      <div className='py-4 pb-8'>
        <Tombstone
          key={id}
          id={id}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </div>
    );
  };

  const renderStatus = (id: string) => {
    return (
      <ThreadStatus
        key={id}
        id={id}
        focusedStatusId={status!.id}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        contextType='thread'
      />
    );
  };

  const renderPendingStatus = (id: string) => {
    const idempotencyKey = id.replace(/^末pending-/, '');

    return (
      <PendingStatus
        key={id}
        idempotencyKey={idempotencyKey}
        thread
      />
    );
  };

  const renderChildren = (list: string[]) => {
    return list.map(id => {
      if (id.endsWith('-tombstone')) {
        return renderTombstone(id);
      } else if (id.startsWith('末pending-')) {
        return renderPendingStatus(id);
      } else {
        return renderStatus(id);
      }
    });
  };

  // Reset media visibility if status changes.
  useEffect(() => {
    setShowMedia(status?.visibility === 'self' ? false : defaultMediaVisibility(status as any, displayMedia));
  }, [status?.id]);

  // Scroll focused status into view when thread updates.
  useEffect(() => {
    scroller.current?.scrollToIndex({
      index: ancestorsIds.length,
      offset: -146,
    });

    setImmediate(() => statusRef.current?.querySelector<HTMLDivElement>('.detailed-actualStatus')?.focus());
  }, [props.params.statusId, status?.id, ancestorsIds.length, isLoaded]);

  const handleRefresh = async () => {
    // TODO
  };

  const handleLoadMore = useCallback(debounce(() => {
    fetchNextPage();
  }, 300, { leading: true }), [fetchNextPage]);

  const handleOpenCompareHistoryModal = (status: StatusEntity) => {
    dispatch(openModal('COMPARE_HISTORY', {
      statusId: status.id,
    }));
  };

  const hasAncestors = ancestorsIds.length > 0;
  const hasDescendants = descendantsIds.length > 0;

  // if (status?.event) {
  //   return (
  //     <Redirect to={`/@${status.account.acct}/events/${status.id}`} />
  //   );
  // }

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <Column>
        <PlaceholderStatus />
      </Column>
    );
  }

  type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

  const handlers: HotkeyHandlers = {
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    openProfile: handleHotkeyOpenProfile,
    toggleHidden: handleHotkeyToggleHidden,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  const focusedStatus = (
    <div className={clsx({ 'pb-4': hasDescendants })} key={status.id}>
      <HotKeys handlers={handlers}>
        <div
          ref={statusRef}
          className='focusable relative'
          tabIndex={0}
          // FIXME: no "reblogged by" text is added for the screen reader
          // aria-label={textForScreenReader(intl, status)}
        >

          <DetailedStatus
            status={normalizeStatus(status) as any}
            showMedia={showMedia}
            onToggleMediaVisibility={handleToggleMediaVisibility}
            onOpenCompareHistoryModal={handleOpenCompareHistoryModal as any}
          />

          {!isUnderReview ? (
            <>
              <hr className='-mx-4 mb-2 max-w-[100vw] border-t-2 dark:border-primary-800' />

              <StatusActionBar
                status={normalizeStatus(status) as any}
                expandable={false}
                space='expand'
                withLabels
              />
            </>
          ) : null}
        </div>
      </HotKeys>

      {hasDescendants && (
        <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 dark:border-primary-800' />
      )}
    </div>
  );

  const children: JSX.Element[] = [];

  if (hasAncestors) {
    children.push(...renderChildren(ancestorsIds));
  }

  children.push(focusedStatus);

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds));
  }

  if (status.group && typeof status.group === 'object') {
    if (status.group.slug && !props.params.groupSlug) {
      return <Redirect to={`/group/${status.group.slug}/posts/${props.params.statusId}`} />;
    }
  }

  const titleMessage = () => {
    if (status.visibility === 'direct') return messages.titleDirect;
    return messages.title;
  };

  return (
    <Column label={intl.formatMessage(titleMessage())}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Stack space={2} className='mt-2'>
          <div ref={node} className='thread'>
            <ScrollableList
              id='thread'
              ref={scroller}
              hasMore={hasNextPage}
              onLoadMore={handleLoadMore}
              placeholderComponent={() => <PlaceholderStatus variant='slim' />}
              initialTopMostItemIndex={ancestorsIds.length}
            >
              {children}
            </ScrollableList>
          </div>

          {!me && <ThreadLoginCta />}
        </Stack>
      </PullToRefresh>
    </Column>
  );
};

export default Thread;
