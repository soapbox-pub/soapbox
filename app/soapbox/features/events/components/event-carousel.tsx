import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactSwipeableViews from 'react-swipeable-views';

import EventPreview from 'soapbox/components/event-preview';
import { Card, Icon } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import PlaceholderEventPreview from '../../placeholder/components/placeholder-event-preview';

import type { OrderedSet as ImmutableOrderedSet } from 'immutable';

const Event = ({ id }: { id: string }) => {
  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id }));

  if (!status) return null;

  return (
    <Link
      className='w-full px-1'
      to={`/@${status.getIn(['account', 'acct'])}/events/${status.id}`}
    >
      <EventPreview status={status} floatingAction={false} />
    </Link>
  );
};

interface IEventCarousel {
  statusIds: ImmutableOrderedSet<string>
  isLoading?: boolean | null
  emptyMessage: React.ReactNode
}

const EventCarousel: React.FC<IEventCarousel> = ({ statusIds, isLoading, emptyMessage }) => {
  const [index, setIndex] = useState(0);

  const handleChangeIndex = (index: number) => {
    setIndex(index % statusIds.size);
  };

  if (isLoading) {
    return <PlaceholderEventPreview />;
  }

  if (statusIds.size === 0) {
    return (
      <Card variant='rounded' size='lg'>
        {emptyMessage}
      </Card>
    );
  }
  return (
    <div className='relative -mx-1'>
      {index !== 0 && (
        <div className='z-10 absolute left-3 top-1/2 -mt-4'>
          <button
            data-testid='prev-page'
            onClick={() => handleChangeIndex(index - 1)}
            className='bg-white/50 dark:bg-gray-900/50 backdrop-blur rounded-full h-8 w-8 flex items-center justify-center'
          >
            <Icon src={require('@tabler/icons/chevron-left.svg')} className='text-black dark:text-white h-6 w-6' />
          </button>
        </div>
      )}
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {statusIds.map(statusId => <Event key={statusId} id={statusId} />)}
      </ReactSwipeableViews>
      {index !== statusIds.size - 1 && (
        <div className='z-10 absolute right-3 top-1/2 -mt-4'>
          <button
            data-testid='next-page'
            onClick={() => handleChangeIndex(index + 1)}
            className='bg-white/50 dark:bg-gray-900/50 backdrop-blur rounded-full h-8 w-8 flex items-center justify-center'
          >
            <Icon src={require('@tabler/icons/chevron-right.svg')} className='text-black dark:text-white h-6 w-6' />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCarousel;
