
import { useRef } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

import LoadGap from 'soapbox/components/load-gap.tsx';
import NewStatus from 'soapbox/components/new-status.tsx';
import ScrollableList, { IScrollableList } from 'soapbox/components/scrollable-list.tsx';
import StatusContainer from 'soapbox/containers/status-container.tsx';
import { EntityTypes, Entities } from 'soapbox/entity-store/entities.ts';
import FeedSuggestions from 'soapbox/features/feed-suggestions/feed-suggestions.tsx';
import PendingStatus from 'soapbox/features/ui/components/pending-status.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';


interface INewStatusList extends Omit<IScrollableList, 'onLoadMore' | 'children'>{
  /** List of statuses to display. */
  statuses: readonly EntityTypes[Entities.STATUSES][]|null;
  /** Pinned statuses to show at the top of the feed. */
  featuredStatusIds?: Set<string>;
  /** Whether the data is currently being fetched. */
  isLoading: boolean;
  /** Pagination callback when the end of the list is reached. */
  onLoadMore?: (lastStatusId: string) => void;


  [key: string]: any;
}

const NewStatusList: React.FC<INewStatusList> = ({
  statuses,
  featuredStatusIds,
  isLoading,
  onLoadMore,
}) => {
  const node = useRef<VirtuosoHandle>(null);
  const soapboxConfig = useSoapboxConfig();

  const getFeaturedStatusCount = () => {
    return featuredStatusIds?.size || 0;
  };

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

  const getCurrentStatusIndex = (id: string, featured: boolean): number => {
    if (featured) {
      return Array.from(featuredStatusIds?.keys() ?? []).findIndex(key => key === id) || 0;
    } else {
      return (
        (statuses?.map(status => status.id) ?? []).findIndex(key => key === id) +
        getFeaturedStatusCount()
      );
    }
  };

  const handleMoveUp = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) - 1;
    selectChild(elementIndex);
  };

  const renderLoadGap = (index: number) => {
    const ids = statuses?.map(status => status.id) ?? [];
    const nextId = ids[index + 1];
    const prevId = ids[index - 1];

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

  const renderStatus = (status: EntityTypes[Entities.STATUSES]) => {
    return (
      <NewStatus
        status={status}
        key={status.id}
        id={status.id}
        onMoveUp={handleMoveUp}
        // onMoveDown={handleMoveDown}
        // contextType={timelineId}
        // showGroup={showGroup}
        // variant={divideType === 'border' ? 'slim' : 'rounded'}
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

    return Array.from(featuredStatusIds).map(statusId => (
      <StatusContainer
        key={`f-${statusId}`}
        id={statusId}
        featured
        onMoveUp={handleMoveUp}
        // onMoveDown={handleMoveDown}
        // contextType={timelineId}
        // showGroup={showGroup}
        // variant={divideType === 'border' ? 'slim' : 'default'}
      />
    ));
  };

  const renderFeedSuggestions = (statusId: string): React.ReactNode => {
    return (
      <FeedSuggestions
        key='suggestions'
        statusId={statusId}
        onMoveUp={handleMoveUp}
        // onMoveDown={handleMoveDown}
      />
    );
  };

  const renderStatuses = (): React.ReactNode[] => {
    if (isLoading || (statuses?.length ?? 0) > 0) {
      return (statuses ?? []).reduce((acc, status, index) => {
        if (status.id === null) {
          const gap = renderLoadGap(index);
          // one does not simply push a null item to Virtuoso: https://github.com/petyosi/react-virtuoso/issues/206#issuecomment-747363793
          if (gap) {
            acc.push(gap);
          }
        } else if (status.id.startsWith('末suggestions-')) {
          if (soapboxConfig.feedInjection) {
            acc.push(renderFeedSuggestions(status.id));
          }
        } else if (status.id.startsWith('末pending-')) {
          acc.push(renderPendingStatus(status.id));
        } else {
          acc.push(renderStatus(status));
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

  return (
    <ScrollableList
      id='status-list'
      key='scrollable-list'
      // isLoading={isLoading}
      // showLoading={isLoading && statusIds.size === 0}
      // onLoadMore={handleLoadOlder}
      // placeholderComponent={() => <PlaceholderStatus variant={divideType === 'border' ? 'slim' : 'rounded'} />}
      // placeholderCount={20}
      // ref={node}
      // listClassName={clsx('divide-y divide-solid divide-gray-200 dark:divide-gray-800', {
      //   'divide-none': divideType !== 'border',
      // }, className)}
      // itemClassName={clsx({
      //   'pb-3': divideType !== 'border',
      // })}
      // {...other}
    >
      {renderScrollableContent()}
    </ScrollableList>
  );
};

export default NewStatusList;