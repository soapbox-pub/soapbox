import { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createSelector } from 'reselect';

import { fetchStatusWithContext, fetchNext } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing_indicator';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import ScrollableList from 'soapbox/components/scrollable_list';
import Tombstone from 'soapbox/components/tombstone';
import { Stack } from 'soapbox/components/ui';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder_status';
import PendingStatus from 'soapbox/features/ui/components/pending_status';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import ThreadStatus from '../status/components/thread-status';

import type { VirtuosoHandle } from 'react-virtuoso';
import type { RootState } from 'soapbox/store';
import type { Attachment as AttachmentEntity } from 'soapbox/types/entities';

const getStatus = makeGetStatus();

const getDescendantsIds = createSelector([
  (_: RootState, statusId: string) => statusId,
  (state: RootState) => state.contexts.replies,
], (statusId, contextReplies) => {
  let descendantsIds = ImmutableOrderedSet<string>();
  const ids = [statusId];

  while (ids.length > 0) {
    const id = ids.shift();
    if (!id) break;

    const replies = contextReplies.get(id);

    if (descendantsIds.includes(id)) {
      break;
    }

    if (statusId !== id) {
      descendantsIds = descendantsIds.union([id]);
    }

    if (replies) {
      replies.reverse().forEach((reply: string) => {
        ids.unshift(reply);
      });
    }
  }

  return descendantsIds;
});

type RouteParams = { statusId: string };

interface IThread {
  params: RouteParams,
  onOpenMedia: (media: ImmutableList<AttachmentEntity>, index: number) => void,
  onOpenVideo: (video: AttachmentEntity, time: number) => void,
}

const Thread: React.FC<IThread> = (props) => {
  const dispatch = useAppDispatch();

  const status = useAppSelector(state => getStatus(state, { id: props.params.statusId }));

  const descendantsIds = useAppSelector(state => {
    let descendantsIds = ImmutableOrderedSet<string>();

    if (status) {
      const statusId = status.id;
      descendantsIds = getDescendantsIds(state, statusId);
      descendantsIds = descendantsIds.delete(statusId);
    }

    return descendantsIds;
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [next, setNext] = useState<string>();

  const node = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle>(null);

  /** Fetch the status (and context) from the API. */
  const fetchData = async() => {
    const { params } = props;
    const { statusId } = params;
    const { next } = await dispatch(fetchStatusWithContext(statusId));
    setNext(next);
  };

  // Load data.
  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [props.params.statusId]);

  const handleMoveUp = (id: string) => {
    const index = ImmutableList(descendantsIds).indexOf(id);
    _selectChild(index - 1);
  };

  const handleMoveDown = (id: string) => {
    const index = ImmutableList(descendantsIds).indexOf(id);
    _selectChild(index + 1);
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

  const renderChildren = (list: ImmutableOrderedSet<string>) => {
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

  const handleRefresh = () => {
    return fetchData();
  };

  const handleLoadMore = useCallback(debounce(() => {
    if (next && status) {
      dispatch(fetchNext(status.id, next)).then(({ next }) => {
        setNext(next);
      }).catch(() => {});
    }
  }, 300, { leading: true }), [next, status]);

  const hasDescendants = descendantsIds.size > 0;

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <PlaceholderStatus />
    );
  }

  const children: JSX.Element[] = [];

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds).toArray());
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Stack space={2}>
        <div ref={node} className='thread p-0 sm:p-2 shadow-none'>
          <ScrollableList
            id='thread'
            ref={scroller}
            hasMore={!!next}
            onLoadMore={handleLoadMore}
            placeholderComponent={() => <PlaceholderStatus thread />}
            initialTopMostItemIndex={0}
          >
            {children}
          </ScrollableList>
        </div>
      </Stack>
    </PullToRefresh>
  );
};

export default Thread;
