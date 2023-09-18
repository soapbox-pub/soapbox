import React, { useEffect, useState } from 'react';

import { useDimensions } from 'soapbox/hooks';

import HStack from '../hstack/hstack';
import Icon from '../icon/icon';

interface ICarousel {
  children: any
  /** Optional height to force on controls */
  controlsHeight?: number
  /** How many items in the carousel */
  itemCount: number
  /** The minimum width per item */
  itemWidth: number
  /** Should the controls be disabled? */
  isDisabled?: boolean
}

/**
 * Carousel
 */
const Carousel: React.FC<ICarousel> = (props): JSX.Element => {
  const { children, controlsHeight, isDisabled, itemCount, itemWidth } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ref, setContainerRef, { width: finalContainerWidth }] = useDimensions();
  const containerWidth = finalContainerWidth || ref?.clientWidth;

  const [pageSize, setPageSize] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const numberOfPages = Math.ceil(itemCount / pageSize);
  const width = containerWidth / (Math.floor(containerWidth / itemWidth));

  const hasNextPage = currentPage < numberOfPages && numberOfPages > 1;
  const hasPrevPage = currentPage > 1 && numberOfPages > 1;

  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrevPage = () => setCurrentPage((prevPage) => prevPage - 1);

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({ width: width || 'auto' });
    }

    return children;
  };

  useEffect(() => {
    if (containerWidth) {
      setPageSize(Math.round(containerWidth / width));
    }
  }, [containerWidth, width]);

  return (
    <HStack alignItems='stretch'>
      <div
        className='z-10 flex w-5 items-center justify-center self-stretch rounded-l-xl bg-white dark:bg-primary-900'
        style={{
          height: controlsHeight || 'auto',
        }}
      >
        <button
          data-testid='prev-page'
          onClick={handlePrevPage}
          className='flex h-full w-7 items-center justify-center transition-opacity duration-500 disabled:opacity-25'
          disabled={!hasPrevPage || isDisabled}
        >
          <Icon
            src={require('@tabler/icons/chevron-left.svg')}
            className='h-5 w-5 text-black dark:text-white'
          />
        </button>
      </div>

      <div className='relative w-full overflow-hidden'>
        <HStack
          alignItems='center'
          style={{
            transform: `translateX(-${(currentPage - 1) * 100}%)`,
          }}
          className='transition-all duration-500 ease-out'
          ref={setContainerRef}
        >
          {renderChildren()}
        </HStack>
      </div>

      <div
        className='z-10 flex w-5 items-center justify-center self-stretch rounded-r-xl bg-white dark:bg-primary-900'
        style={{
          height: controlsHeight || 'auto',
        }}
      >
        <button
          data-testid='next-page'
          onClick={handleNextPage}
          className='flex h-full w-7 items-center justify-center transition-opacity duration-500 disabled:opacity-25'
          disabled={!hasNextPage || isDisabled}
        >
          <Icon
            src={require('@tabler/icons/chevron-right.svg')}
            className='h-5 w-5 text-black dark:text-white'
          />
        </button>
      </div>
    </HStack>
  );
};

export default Carousel;