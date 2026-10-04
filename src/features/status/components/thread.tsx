import { createSelector } from '@reduxjs/toolkit';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { type VirtuosoHandle } from 'react-virtuoso';

import { mentionCompose, replyCompose } from '@/actions/compose.ts';
import { favourite, reblog, unfavourite, unreblog } from '@/actions/interactions.ts';
import { openModal } from '@/actions/modals.ts';
import { getSettings } from '@/actions/settings.ts';
import { hideStatus, revealStatus } from '@/actions/statuses.ts';
import ScrollableList from '@/components/scrollable-list.tsx';
import StatusActionBar from '@/components/status-action-bar.tsx';
import Tombstone from '@/components/tombstone.tsx';
import Stack from '@/components/ui/stack.tsx';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status.tsx';
import { HotKeys } from '@/features/ui/components/hotkeys.tsx';
import PendingStatus from '@/features/ui/components/pending-status.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useSettings } from '@/hooks/useSettings.ts';
import { RootState } from '@/store.ts';
import { type Account, type Status } from '@/types/entities.ts';
import { defaultMediaVisibility, textForScreenReader } from '@/utils/status.ts';

import DetailedStatus from './detailed-status.tsx';
import ThreadStatus from './thread-status.tsx';

const getAncestorsIds = createSelector([
  (_: RootState, statusId: string | undefined) => statusId,
  (state: RootState) => state.contexts.inReplyTos,
], (statusId, inReplyTos): string[] => {
  const ancestorsIds: string[] = [];
  let id: string | undefined = statusId;

  while (id && !ancestorsIds.includes(id)) {
    ancestorsIds.unshift(id);
    id = inReplyTos[id];
  }

  return ancestorsIds;
});

export const getDescendantsIds = createSelector([
  (_: RootState, statusId: string) => statusId,
  (state: RootState) => state.contexts.replies,
], (statusId, contextReplies): string[] => {
  const descendantsIds: string[] = [];
  const ids = [statusId];

  while (ids.length > 0) {
    const id = ids.shift();
    if (!id) break;

    const replies = contextReplies[id];

    if (descendantsIds.includes(id)) {
      break;
    }

    if (statusId !== id) {
      descendantsIds.push(id);
    }

    if (replies) {
      [...replies].reverse().forEach((reply: string) => {
        ids.unshift(reply);
      });
    }
  }

  return descendantsIds;
});

interface IThread {
  status: Status;
  withMedia?: boolean;
  useWindowScroll?: boolean;
  itemClassName?: string;
  next?: string | null;
  handleLoadMore: () => void;
}

const Thread = (props: IThread) => {
  const {
    handleLoadMore,
    itemClassName,
    next,
    status,
    useWindowScroll = true,
    withMedia = true,
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();
  const { displayMedia } = useSettings();

  const isUnderReview = status?.visibility === 'self';


  const { ancestorsIds, descendantsIds } = useAppSelector((state) => {
    let ancestorsIds: string[] = [];
    let descendantsIds: string[] = [];

    if (status) {
      const statusId = status.id;
      const allAncestorsIds = getAncestorsIds(state, state.contexts.inReplyTos[statusId]);
      const allDescendantsIds = getDescendantsIds(state, statusId);
      ancestorsIds = allAncestorsIds.filter(id => id !== statusId && !allDescendantsIds.includes(id));
      descendantsIds = allDescendantsIds.filter(id => id !== statusId && !ancestorsIds.includes(id));
    }

    return {
      status,
      ancestorsIds,
      descendantsIds,
    };
  });

  let initialTopMostItemIndex = ancestorsIds.length;
  if (!useWindowScroll && initialTopMostItemIndex !== 0) initialTopMostItemIndex = ancestorsIds.length + 1;

  const [showMedia, setShowMedia] = useState<boolean>(status?.visibility === 'self' ? false : defaultMediaVisibility(status, displayMedia));

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

  const handleFavouriteClick = (status: Status) => {
    if (status.favourited) {
      dispatch(unfavourite(status));
    } else {
      dispatch(favourite(status));
    }
  };

  const handleReplyClick = (status: Status) => dispatch(replyCompose(status));

  const handleModalReblog = (status: Status) => dispatch(reblog(status));

  const handleReblogClick = (status: Status, e?: React.MouseEvent) => {
    dispatch((_, getState) => {
      const boostModal = getSettings(getState()).boostModal;
      if (status.reblogged) {
        dispatch(unreblog(status));
      } else {
        if ((e && e.shiftKey) || !boostModal) {
          handleModalReblog(status);
        } else {
          dispatch(openModal('BOOST', { status: status, onReblog: handleModalReblog }));
        }
      }
    });
  };

  const handleMentionClick = (account: Account) => dispatch(mentionCompose(account));

  const handleHotkeyOpenMedia = (e?: KeyboardEvent) => {
    const media = status?.media_attachments;

    e?.preventDefault();

    if (media && media.length) {
      const firstAttachment = media[0]!;

      if (media.length === 1 && firstAttachment.type === 'video') {
        dispatch(openModal('VIDEO', { media: firstAttachment, status: status }));
      } else {
        dispatch(openModal('MEDIA', { media: media, index: 0, status: status }));
      }
    }
  };

  const handleToggleHidden = (status: Status) => {
    if (status.hidden) {
      dispatch(revealStatus(status.id));
    } else {
      dispatch(hideStatus(status.id));
    }
  };

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
    history.push(`/@${status!.account?.acct}`);
  };

  const handleHotkeyToggleHidden = () => {
    handleToggleHidden(status!);
  };

  const handleHotkeyToggleSensitive = () => {
    handleToggleMediaVisibility();
  };

  const handleMoveUp = (id: string) => {
    if (id === status?.id) {
      _selectChild(ancestorsIds.length - 1);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
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
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        _selectChild(ancestorsIds.length + index + 2);
      } else {
        _selectChild(index + 1);
      }
    }
  };

  const _selectChild = (index: number) => {
    if (!useWindowScroll) index = index + 1;
    scroller.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        node.current?.querySelector<HTMLDivElement>(`[data-index="${index}"] .focusable`)?.focus();
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
    setShowMedia(status?.visibility === 'self' ? false : defaultMediaVisibility(status, displayMedia));
  }, [status.id]);

  // Scroll focused status into view when thread updates.
  useEffect(() => {
    scroller.current?.scrollToIndex({
      index: ancestorsIds.length,
      offset: -146,
    });

    setTimeout(() => statusRef.current?.querySelector<HTMLDivElement>('.detailed-actualStatus')?.focus(), 0);
  }, [status.id, ancestorsIds.length]);

  const handleOpenCompareHistoryModal = (status: Status) => {
    dispatch(openModal('COMPARE_HISTORY', {
      statusId: status.id,
    }));
  };

  const hasAncestors = ancestorsIds.length > 0;
  const hasDescendants = descendantsIds.length > 0;

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
          aria-label={textForScreenReader(intl, status)}
        >

          <DetailedStatus
            status={status}
            showMedia={showMedia}
            withMedia={withMedia}
            onToggleMediaVisibility={handleToggleMediaVisibility}
            onOpenCompareHistoryModal={handleOpenCompareHistoryModal}
          />

          {!isUnderReview ? (
            <>
              <hr className='-mx-4 mb-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />

              <StatusActionBar
                status={status}
                expandable={false}
                space='lg'
              />
            </>
          ) : null}
        </div>
      </HotKeys>

      <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />
    </div>
  );

  const children: JSX.Element[] = [];

  if (!useWindowScroll) {
    // Add padding to the top of the Thread (for Media Modal)
    children.push(<div key='padding' className='h-4' />);
  }

  if (hasAncestors) {
    children.push(...renderChildren(ancestorsIds));
  }

  children.push(focusedStatus);

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds));
  }

  return (
    <Stack
      space={2}
      className={
        clsx({
          'h-full': !useWindowScroll,
          'mt-2': useWindowScroll,
        })
      }
    >
      <div
        ref={node}
        className={
          clsx('thread', {
            'h-full': !useWindowScroll,
          })
        }
      >
        <ScrollableList
          id='thread'
          ref={scroller}
          hasMore={!!next}
          onLoadMore={handleLoadMore}
          placeholderComponent={() => <PlaceholderStatus />}
          initialTopMostItemIndex={initialTopMostItemIndex}
          useWindowScroll={useWindowScroll}
          itemClassName={itemClassName}
          listClassName={
            clsx({
              'h-full': !useWindowScroll,
            })
          }
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export default Thread;
