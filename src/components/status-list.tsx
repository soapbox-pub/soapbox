import clsx from 'clsx';
import { debounce } from 'es-toolkit';
import { useRef, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import LoadGap from 'soapbox/components/load-gap.tsx';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import StatusContainer from 'soapbox/containers/status-container.tsx';
import FeedSuggestions from 'soapbox/features/feed-suggestions/feed-suggestions.tsx';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status.tsx';
import PendingStatus from 'soapbox/features/ui/components/pending-status.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';

import type { OrderedSet as ImmutableOrderedSet } from 'immutable';
import type { VirtuosoHandle } from 'react-virtuoso';
import type { IScrollableList } from 'soapbox/components/scrollable-list.tsx';

interface IStatusList extends Omit<IScrollableList, 'onLoadMore' | 'children'> {
  /** Unique key to preserve the scroll position when navigating back. */
  scrollKey: string;
  /** List of status IDs to display. */
  statusIds: ImmutableOrderedSet<string>;
  /** Last _unfiltered_ status ID (maxId) for pagination. */
  lastStatusId?: string;
  /** Pinned statuses to show at the top of the feed. */
  featuredStatusIds?: ImmutableOrderedSet<string>;
  /** Pagination callback when the end of the list is reached. */
  onLoadMore?: (lastStatusId: string) => void;
  /** Whether the data is currently being fetched. */
  isLoading: boolean;
  /** Whether the server did not return a complete page. */
  isPartial?: boolean;
  /** Whether we expect an additional page of data. */
  hasMore: boolean;
  /** Message to display when the list is loaded but empty. */
  emptyMessage: React.ReactNode;
  /** ID of the timeline in Redux. */
  timelineId?: string;
  /** Whether to display ads. */
  showAds?: boolean;
  /** Whether to show group information. */
  showGroup?: boolean;
}

/**
 * Legacy Feed of statuses, built atop ScrollableList.
 * @deprecated Use the PureStatusList component.
 */
const StatusList: React.FC<IStatusList> = ({
  statusIds,
  lastStatusId,
  featuredStatusIds,
  onLoadMore,
  timelineId,
  isLoading,
  isPartial,
  showAds = false,
  showGroup = true,
  className,
  ...other
}) => {
  const soapboxConfig = useSoapboxConfig();
  const node = useRef<VirtuosoHandle>(null);

  const getFeaturedStatusCount = () => {
    return featuredStatusIds?.size || 0;
  };

  const getCurrentStatusIndex = (id: string, featured: boolean): number => {
    if (featured) {
      return featuredStatusIds?.keySeq().findIndex(key => key === id) || 0;
    } else {
      return statusIds.keySeq().findIndex(key => key === id) + getFeaturedStatusCount();
    }
  };

  const handleMoveUp = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) + 1;
    selectChild(elementIndex);
  };

  const handleLoadOlder = useCallback(debounce(() => {
    const maxId = lastStatusId || statusIds.last();
    if (onLoadMore && maxId) {
      onLoadMore(maxId.replace('末suggestions-', ''));
    }
  }, 300, { edges: ['leading'] }), [onLoadMore, lastStatusId, statusIds.last()]);

  const selectChild = (index: number) => {
    node.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        const element = document.querySelector<HTMLDivElement>(`#status-list [data-index="${index}"] .focusable`);
        element?.focus();
      },
    });
  };

  const renderLoadGap = (index: number) => {
    const ids = statusIds.toList();
    const nextId = ids.get(index + 1);
    const prevId = ids.get(index - 1);

    if (index < 1 || !nextId || !prevId || !onLoadMore) return null;

    return (
      <LoadGap
        key={'gap:' + nextId}
        disabled={isLoading}
        maxId={prevId!}
        onClick={onLoadMore}
      />
    );
  };

  const renderStatus = (statusId: string) => {
    return (
      <StatusContainer
        key={statusId}
        id={statusId}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        contextType={timelineId}
        showGroup={showGroup}
      />
    );
  };

  const renderPendingStatus = (statusId: string) => {
    const idempotencyKey = statusId.replace(/^末pending-/, '');

    return (
      <PendingStatus
        key={statusId}
        idempotencyKey={idempotencyKey}
      />
    );
  };

  const renderFeaturedStatuses = (): React.ReactNode[] => {
    if (!featuredStatusIds) return [];

    return featuredStatusIds.toArray().map(statusId => (
      <StatusContainer
        key={`f-${statusId}`}
        id={statusId}
        featured
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        contextType={timelineId}
        showGroup={showGroup}
      />
    ));
  };

  const renderFeedSuggestions = (statusId: string): React.ReactNode => {
    return (
      <FeedSuggestions
        key='suggestions'
        statusId={statusId}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    );
  };

  const renderStatuses = (): React.ReactNode[] => {
    if (isLoading || statusIds.size > 0) {
      return statusIds.toList().reduce((acc, statusId, index) => {
        if (statusId === null) {
          const gap = renderLoadGap(index);
          // one does not simply push a null item to Virtuoso: https://github.com/petyosi/react-virtuoso/issues/206#issuecomment-747363793
          if (gap) {
            acc.push(gap);
          }
        } else if (statusId.startsWith('末suggestions-')) {
          if (soapboxConfig.feedInjection) {
            acc.push(renderFeedSuggestions(statusId));
          }
        } else if (statusId.startsWith('末pending-')) {
          acc.push(renderPendingStatus(statusId));
        } else {
          acc.push(renderStatus(statusId));
        }

        return acc;
      }, [] as React.ReactNode[]);
    } else {
      return [];
    }
  };

  const renderScrollableContent = () => {
    const featuredStatuses = renderFeaturedStatuses();
    const statuses = renderStatuses();

    if (featuredStatuses && statuses) {
      return featuredStatuses.concat(statuses);
    } else {
      return statuses;
    }
  };

  if (isPartial) {
    return (
      <div className='flex flex-1 cursor-default items-center justify-center rounded-lg p-5 text-center text-[16px] font-medium text-gray-900 sm:rounded-none'>
        <div className='w-full bg-transparent pt-0'>
          <div>
            <strong className='mb-2.5 block text-gray-900'>
              <FormattedMessage id='regeneration_indicator.label' defaultMessage='Loading…' />
            </strong>
            <FormattedMessage id='regeneration_indicator.sublabel' defaultMessage='Your home feed is being prepared!' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollableList
      id='status-list'
      key='scrollable-list'
      isLoading={isLoading}
      showLoading={isLoading && statusIds.size === 0}
      onLoadMore={handleLoadOlder}
      placeholderComponent={() => <PlaceholderStatus />}
      placeholderCount={20}
      ref={node}
      listClassName={clsx('divide-y divide-solid divide-gray-200 dark:divide-gray-800', className)}
      {...other}
    >
      {renderScrollableContent()}
    </ScrollableList>
  );
};

export default StatusList;
export type { IStatusList };
