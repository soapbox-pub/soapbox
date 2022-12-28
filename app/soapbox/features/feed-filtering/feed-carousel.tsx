import classNames from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { replaceHomeTimeline } from 'soapbox/actions/timelines';
import { useAppDispatch, useAppSelector, useDimensions } from 'soapbox/hooks';
import { Avatar, useCarouselAvatars, useMarkAsSeen } from 'soapbox/queries/carousels';

import { Card, HStack, Icon, Stack, Text } from '../../components/ui';
import PlaceholderAvatar from '../placeholder/components/placeholder-avatar';

const CarouselItem = React.forwardRef((
  { avatar, seen, onViewed, onPinned }: { avatar: Avatar, seen: boolean, onViewed: (account_id: string) => void, onPinned?: (avatar: null | Avatar) => void },
  ref: any,
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
      dispatch(replaceHomeTimeline(null, { maxId: null }, () => setLoading(false)));

      if (onPinned) {
        onPinned(null);
      }
    } else {
      if (onPinned) {
        onPinned(avatar);
      }

      onViewed(avatar.account_id);
      markAsSeen.mutate(avatar.account_id);
      dispatch(replaceHomeTimeline(avatar.account_id, { maxId: null }, () => setLoading(false)));
    }
  };

  return (
    <div
      ref={ref}
      aria-disabled={isFetching}
      onClick={handleClick}
      className='cursor-pointer snap-start py-4'
      role='filter-feed-by-user'
      data-testid='carousel-item'
    >
      <Stack className='w-14 h-auto' space={3}>
        <div className='block mx-auto relative w-12 h-12 rounded-full'>
          {isSelected && (
            <div className='absolute inset-0 bg-primary-600 bg-opacity-50 rounded-full flex items-center justify-center'>
              <Icon src={require('@tabler/icons/check.svg')} className='text-white h-6 w-6' />
            </div>
          )}

          <img
            src={avatar.account_avatar}
            className={classNames({
              'w-12 h-12 min-w-[48px] rounded-full ring-2 ring-offset-4 dark:ring-offset-primary-900': true,
              'ring-transparent': !isSelected && seen,
              'ring-primary-600': isSelected,
              'ring-accent-500': !seen && !isSelected,
            })}
            alt={avatar.acct}
            data-testid='carousel-item-avatar'
          />
        </div>

        <Text theme='muted' size='sm' truncate align='center' className='leading-3 pb-0.5'>{avatar.acct}</Text>
      </Stack>
    </div>
  );
});

const FeedCarousel = () => {
  const { data: avatars, isFetching, isFetched, isError } = useCarouselAvatars();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_ref, setContainerRef, { width }] = useDimensions();

  const [seenAccountIds, setSeenAccountIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pinnedAvatar, setPinnedAvatar] = useState<Avatar | null>(null);

  const avatarsToList = useMemo(() => {
    const list = avatars.filter((avatar) => avatar.account_id !== pinnedAvatar?.account_id);
    if (pinnedAvatar) {
      return [null, ...list];
    }

    return list;
  }, [avatars, pinnedAvatar]);

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
      className='rounded-xl bg-white dark:bg-primary-900 shadow-lg dark:shadow-none overflow-hidden'
      data-testid='feed-carousel'
    >
      <HStack alignItems='stretch'>
        <div className='z-10 rounded-l-xl bg-white dark:bg-primary-900 w-8 flex self-stretch items-center justify-center'>
          <button
            data-testid='prev-page'
            onClick={handlePrevPage}
            className='w-7 flex items-center justify-center disabled:opacity-25 transition-opacity duration-500'
            disabled={!hasPrevPage}
          >
            <Icon src={require('@tabler/icons/chevron-left.svg')} className='text-black dark:text-white h-5 w-5' />
          </button>
        </div>

        <div className='overflow-hidden relative'>
          {pinnedAvatar ? (
            <div
              className='z-10 flex items-center justify-center absolute left-0 top-0 bottom-0 bg-white dark:bg-primary-900'
              style={{
                width: widthPerAvatar,
              }}
            >
              <CarouselItem
                avatar={pinnedAvatar}
                seen={seenAccountIds?.includes(pinnedAvatar.account_id)}
                onViewed={markAsSeen}
                onPinned={(avatar) => setPinnedAvatar(avatar)}
              />
            </div>
          ) : null}

          <HStack
            alignItems='center'
            style={{
              transform: `translateX(-${(currentPage - 1) * 100}%)`,
            }}
            className='transition-all ease-out duration-500'
            ref={setContainerRef}
          >
            {isFetching ? (
              new Array(20).fill(0).map((_, idx) => (
                <div className='flex flex-shrink-0 justify-center' style={{ width: widthPerAvatar }} key={idx}>
                  <PlaceholderAvatar size={56} withText />
                </div>
              ))
            ) : (
              avatarsToList.map((avatar: any, index) => (
                <div
                  key={avatar?.account_id || index}
                  className='flex flex-shrink-0 justify-center'
                  style={{
                    width: widthPerAvatar,
                  }}
                >
                  {avatar === null ? (
                    <Stack className='w-14 snap-start py-4 h-auto' space={3}>
                      <div className='block mx-auto relative w-16 h-16 rounded-full'>
                        <div className='w-16 h-16' />
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

        <div className='z-10 rounded-r-xl bg-white dark:bg-primary-900 w-8 self-stretch flex items-center justify-center'>
          <button
            data-testid='next-page'
            onClick={handleNextPage}
            className='w-7 h-full flex items-center justify-center disabled:opacity-25 transition-opacity duration-500'
            disabled={!hasNextPage}
          >
            <Icon src={require('@tabler/icons/chevron-right.svg')} className='text-black dark:text-white h-5 w-5' />
          </button>
        </div>
      </HStack>
    </div>
  );
};

export default FeedCarousel;
