import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { replaceHomeTimeline } from 'soapbox/actions/timelines';
import { useAppDispatch, useAppSelector, useDimensions } from 'soapbox/hooks';
import { Avatar, useCarouselAvatars, useMarkAsSeen } from 'soapbox/queries/carousels';

import { Card, HStack, Icon, Stack, Text } from '../../components/ui';
import PlaceholderAvatar from '../placeholder/components/placeholder-avatar';

const CarouselItem = React.forwardRef((
  { avatar, seen, onViewed, onPinned }: { avatar: Avatar, seen: boolean, onViewed: (account_id: string) => void, onPinned?: (avatar: null | Avatar) => void },
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const dispatch = useAppDispatch();

  const markAsSeen = useMarkAsSeen();

  const selectedAccountId = useAppSelector(state => state.timelines.getIn(['home', 'feedAccountId']) as string);
  const isSelected = avatar.account_id === selectedAccountId;

  const [isFetching, setLoading] = useState<boolean>(false);

  const handleClick = () => {
    if (isFetching) {
      return;
    }

    setLoading(true);

    if (isSelected) {
      dispatch(replaceHomeTimeline(undefined, { maxId: null }, () => setLoading(false)));

      if (onPinned) {
        onPinned(null);
      }
    } else {
      if (onPinned) {
        onPinned(avatar);
      }

      if (!seen) {
        onViewed(avatar.account_id);
        markAsSeen.mutate(avatar.account_id);
      }

      dispatch(replaceHomeTimeline(avatar.account_id, { maxId: null }, () => setLoading(false)));
    }
  };

  return (
    <div
      ref={ref}
      aria-disabled={isFetching}
      onClick={handleClick}
      className='cursor-pointer py-4'
      role='filter-feed-by-user'
      data-testid='carousel-item'
    >
      <Stack className='h-auto w-14' space={3}>
        <div className='relative mx-auto block h-12 w-12 rounded-full'>
          {isSelected && (
            <div className='absolute inset-0 flex items-center justify-center rounded-full bg-primary-600/50'>
              <Icon src={require('@tabler/icons/check.svg')} className='h-6 w-6 text-white' />
            </div>
          )}

          <img
            src={avatar.account_avatar}
            className={clsx({
              'w-12 h-12 min-w-[48px] rounded-full ring-2 ring-offset-4 dark:ring-offset-primary-900': true,
              'ring-transparent': !isSelected && seen,
              'ring-primary-600': isSelected,
              'ring-accent-500': !seen && !isSelected,
            })}
            alt={avatar.acct}
            data-testid='carousel-item-avatar'
          />
        </div>

        <Text theme='muted' size='sm' truncate align='center' className='pb-0.5 leading-3'>{avatar.acct}</Text>
      </Stack>
    </div>
  );
});

const FeedCarousel = () => {
  const { data: avatars, isFetching, isFetched, isError } = useCarouselAvatars();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_ref, setContainerRef, { width }] = useDimensions();
  const carouselItemRef = useRef<HTMLDivElement>(null);

  const [seenAccountIds, setSeenAccountIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pinnedAvatar, setPinnedAvatar] = useState<Avatar | null>(null);

  const avatarsToList = useMemo(() => {
    let list: (Avatar | null)[] = avatars.filter((avatar) => avatar.account_id !== pinnedAvatar?.account_id);

    // If we have an Avatar pinned, let's create a new array with "null"
    // in the first position of each page.
    if (pinnedAvatar) {
      const index = (currentPage - 1) * pageSize;
      list = [
        ...list.slice(0, index),
        null,
        ...list.slice(index),
      ];
    }

    return list;
  }, [avatars, pinnedAvatar, currentPage, pageSize]);

  const numberOfPages = Math.ceil(avatars.length / pageSize);
  const widthPerAvatar = width / (Math.floor(width / 80));

  const hasNextPage = currentPage < numberOfPages && numberOfPages > 1;
  const hasPrevPage = currentPage > 1 && numberOfPages > 1;

  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrevPage = () => setCurrentPage((prevPage) => prevPage - 1);

  const markAsSeen = (account_id: string) => {
    setSeenAccountIds((prev) => [...prev, account_id]);
  };

  useEffect(() => {
    if (avatars.length > 0) {
      setSeenAccountIds(
        avatars
          .filter((avatar) => avatar.seen !== false)
          .map((avatar) => avatar.account_id),
      );
    }
  }, [avatars]);

  useEffect(() => {
    if (width) {
      setPageSize(Math.round(width / widthPerAvatar));
    }
  }, [width, widthPerAvatar]);

  if (isError) {
    return (
      <Card variant='rounded' size='lg' data-testid='feed-carousel-error'>
        <Text align='center'>
          <FormattedMessage id='common.error' defaultMessage="Something isn't right. Try reloading the page." />
        </Text>
      </Card>
    );
  }

  if (isFetched && avatars.length === 0) {
    return null;
  }

  return (
    <div
      className='overflow-hidden rounded-xl bg-white shadow-lg dark:bg-primary-900 dark:shadow-none'
      data-testid='feed-carousel'
    >
      <HStack alignItems='stretch'>
        <div className='z-10 flex w-8 items-center justify-center self-stretch rounded-l-xl bg-white dark:bg-primary-900'>
          <button
            data-testid='prev-page'
            onClick={handlePrevPage}
            className='flex h-full w-7 items-center justify-center transition-opacity duration-500 disabled:opacity-25'
            disabled={!hasPrevPage}
          >
            <Icon src={require('@tabler/icons/chevron-left.svg')} className='h-5 w-5 text-black dark:text-white' />
          </button>
        </div>

        <div className='relative w-full overflow-hidden'>
          {pinnedAvatar ? (
            <div
              className='absolute inset-y-0 left-0 z-10 flex items-center justify-center bg-white dark:bg-primary-900'
              style={{
                width: widthPerAvatar || 'auto',
              }}
            >
              <CarouselItem
                avatar={pinnedAvatar}
                seen={seenAccountIds?.includes(pinnedAvatar.account_id)}
                onViewed={markAsSeen}
                onPinned={(avatar) => setPinnedAvatar(avatar)}
                ref={carouselItemRef}
              />
            </div>
          ) : null}

          <HStack
            alignItems='center'
            style={{
              transform: `translateX(-${(currentPage - 1) * 100}%)`,
            }}
            className='transition-all duration-500 ease-out'
            ref={setContainerRef}
          >
            {isFetching ? (
              new Array(20).fill(0).map((_, idx) => (
                <div
                  className='flex shrink-0 justify-center'
                  style={{ width: widthPerAvatar || 'auto' }}
                  key={idx}
                >
                  <PlaceholderAvatar size={56} withText className='py-3' />
                </div>
              ))
            ) : (
              avatarsToList.map((avatar: any, index) => (
                <div
                  key={avatar?.account_id || index}
                  className='flex shrink-0 justify-center'
                  style={{
                    width: widthPerAvatar || 'auto',
                  }}
                >
                  {avatar === null ? (
                    <Stack
                      className='h-auto w-14 py-4'
                      space={3}
                      style={{ height: carouselItemRef.current?.clientHeight }}
                    >
                      <div className='relative mx-auto block h-16 w-16 rounded-full'>
                        <div className='h-16 w-16' />
                      </div>
                    </Stack>
                  ) : (
                    <CarouselItem
                      avatar={avatar}
                      seen={seenAccountIds?.includes(avatar.account_id)}
                      onPinned={(avatar) => {
                        setPinnedAvatar(null);
                        setTimeout(() => {
                          setPinnedAvatar(avatar);
                        }, 1);
                      }}
                      onViewed={markAsSeen}
                    />
                  )}
                </div>
              ))
            )}
          </HStack>
        </div>

        <div className='z-10 flex w-8 items-center justify-center self-stretch rounded-r-xl bg-white dark:bg-primary-900'>
          <button
            data-testid='next-page'
            onClick={handleNextPage}
            className='flex h-full w-7 items-center justify-center transition-opacity duration-500 disabled:opacity-25'
            disabled={!hasNextPage}
          >
            <Icon src={require('@tabler/icons/chevron-right.svg')} className='h-5 w-5 text-black dark:text-white' />
          </button>
        </div>
      </HStack>
    </div>
  );
};

export default FeedCarousel;
