import { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { eventDiscussionCompose } from 'soapbox/actions/compose';
import { fetchStatusWithContext, fetchNext } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing-indicator';
import ScrollableList from 'soapbox/components/scrollable-list';
import Tombstone from 'soapbox/components/tombstone';
import { Stack } from 'soapbox/components/ui';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import PendingStatus from 'soapbox/features/ui/components/pending-status';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import ComposeForm from '../compose/components/compose-form';
import { getDescendantsIds } from '../status/components/thread';
import ThreadStatus from '../status/components/thread-status';

import type { VirtuosoHandle } from 'react-virtuoso';
import type { Attachment as AttachmentEntity } from 'soapbox/types/entities';

type RouteParams = { statusId: string };

interface IEventDiscussion {
  params: RouteParams
  onOpenMedia: (media: ImmutableList<AttachmentEntity>, index: number) => void
  onOpenVideo: (video: AttachmentEntity, time: number) => void
}

const EventDiscussion: React.FC<IEventDiscussion> = (props) => {
  const dispatch = useAppDispatch();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id: props.params.statusId }));

  const me = useAppSelector((state) => state.me);

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

  const fetchData = async() => {
    const { params } = props;
    const { statusId } = params;
    const { next } = await dispatch(fetchStatusWithContext(statusId));
    setNext(next);
  };

  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [props.params.statusId]);

  useEffect(() => {
    if (isLoaded && me) dispatch(eventDiscussionCompose(`reply:${props.params.statusId}`, status!));
  }, [isLoaded, me]);

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
    <Stack space={2}>
      {me && <div className='border-b border-solid border-gray-200 p-2 pt-0 dark:border-gray-800'>
        <ComposeForm id={`reply:${status.id}`} autoFocus={false} event={status.id} />
      </div>}
      <div ref={node} className='thread p-0 shadow-none sm:p-2'>
        <ScrollableList
          id='thread'
          ref={scroller}
          hasMore={!!next}
          onLoadMore={handleLoadMore}
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          initialTopMostItemIndex={0}
          emptyMessage={<FormattedMessage id='event.discussion.empty' defaultMessage='No one has commented this event yet. When someone does, they will appear here.' />}
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export default EventDiscussion;
