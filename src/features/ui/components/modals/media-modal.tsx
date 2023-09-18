import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import ReactSwipeableViews from 'react-swipeable-views';

import { fetchNext, fetchStatusWithContext } from 'soapbox/actions/statuses';
import ExtendedVideoPlayer from 'soapbox/components/extended-video-player';
import MissingIndicator from 'soapbox/components/missing-indicator';
import StatusActionBar from 'soapbox/components/status-action-bar';
import { Icon, IconButton, HStack, Stack } from 'soapbox/components/ui';
import Audio from 'soapbox/features/audio';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import Thread from 'soapbox/features/status/components/thread';
import Video from 'soapbox/features/video';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { isUserTouching } from 'soapbox/is-mobile';
import { makeGetStatus } from 'soapbox/selectors';

import ImageLoader from '../image-loader';

import type { List as ImmutableList } from 'immutable';
import type { Attachment, Status } from 'soapbox/types/entities';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  expand: { id: 'lightbox.expand', defaultMessage: 'Expand' },
  minimize: { id: 'lightbox.minimize', defaultMessage: 'Minimize' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
});

// you can't use 100vh, because the viewport height is taller
// than the visible part of the document in some mobile
// browsers when it's address bar is visible.
// https://developers.google.com/web/updates/2016/12/url-bar-resizing
const swipeableViewsStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const containerStyle: React.CSSProperties = {
  alignItems: 'center', // center vertically
};

interface IMediaModal {
  media: ImmutableList<Attachment>
  status?: Status
  index: number
  time?: number
  onClose(): void
}

const MediaModal: React.FC<IMediaModal> = (props) => {
  const {
    media,
    status,
    onClose,
    time = 0,
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const getStatus = useCallback(makeGetStatus(), []);
  const actualStatus = useAppSelector((state) => getStatus(state, { id: status?.id as string }));

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [next, setNext] = useState<string>();
  const [index, setIndex] = useState<number | null>(null);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!status);

  const hasMultipleImages = media.size > 1;

  const handleSwipe = (index: number) => setIndex(index % media.size);
  const handleNextClick = () => setIndex((getIndex() + 1) % media.size);
  const handlePrevClick = () => setIndex((media.size + getIndex() - 1) % media.size);

  const navigationHiddenClassName = navigationHidden ? 'pointer-events-none opacity-0' : '';

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevClick();
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowRight':
        handleNextClick();
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  const handleDownload = () => {
    const mediaItem = hasMultipleImages ? media.get(index as number) : media.get(0);
    window.open(mediaItem?.url);
  };

  const getIndex = () => index !== null ? index : props.index;

  const toggleNavigation = () => {
    setNavigationHidden(value => !value && isUserTouching());
  };

  const handleStatusClick: React.MouseEventHandler = e => {
    if (status && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      history.push(`/@${status.account.acct}/posts/${status?.id}`);
      onClose();
    }
  };

  const content = media.map((attachment, i) => {
    const width  = (attachment.meta.getIn(['original', 'width']) || undefined) as number | undefined;
    const height = (attachment.meta.getIn(['original', 'height']) || undefined) as number | undefined;

    const link = (status && (
      <a href={status.url} onClick={handleStatusClick}>
        <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
      </a>
    ));

    if (attachment.type === 'image') {
      return (
        <ImageLoader
          previewSrc={attachment.preview_url}
          src={attachment.url}
          width={width}
          height={height}
          alt={attachment.description}
          key={attachment.url}
          onClick={toggleNavigation}
        />
      );
    } else if (attachment.type === 'video') {
      return (
        <Video
          preview={attachment.preview_url}
          blurhash={attachment.blurhash}
          src={attachment.url}
          width={width}
          height={height}
          startTime={time}
          detailed
          autoFocus={i === getIndex()}
          link={link}
          alt={attachment.description}
          key={attachment.url}
          visible
        />
      );
    } else if (attachment.type === 'audio') {
      return (
        <Audio
          src={attachment.url}
          alt={attachment.description}
          poster={attachment.preview_url !== attachment.url ? attachment.preview_url : (status?.getIn(['account', 'avatar_static'])) as string | undefined}
          backgroundColor={attachment.meta.getIn(['colors', 'background']) as string | undefined}
          foregroundColor={attachment.meta.getIn(['colors', 'foreground']) as string | undefined}
          accentColor={attachment.meta.getIn(['colors', 'accent']) as string | undefined}
          duration={attachment.meta.getIn(['original', 'duration'], 0) as number | undefined}
          key={attachment.url}
        />
      );
    } else if (attachment.type === 'gifv') {
      return (
        <ExtendedVideoPlayer
          src={attachment.url}
          muted
          controls={false}
          width={width}
          height={height}
          key={attachment.preview_url}
          alt={attachment.description}
          onClick={toggleNavigation}
        />
      );
    }

    return null;
  }).toArray();

  const handleLoadMore = useCallback(debounce(() => {
    if (next && status) {
      dispatch(fetchNext(status?.id, next)).then(({ next }) => {
        setNext(next);
      }).catch(() => { });
    }
  }, 300, { leading: true }), [next, status]);

  /** Fetch the status (and context) from the API. */
  const fetchData = async () => {
    const { next } = await dispatch(fetchStatusWithContext(status?.id as string));
    setNext(next);
  };

  // Load data.
  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [status?.id]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [index]);

  if (status) {
    if (!actualStatus && isLoaded) {
      return (
        <MissingIndicator />
      );
    } else if (!actualStatus) {
      return <PlaceholderStatus />;
    }
  }

  const handleClickOutside: React.MouseEventHandler<HTMLElement> = (e) => {
    if ((e.target as HTMLElement).tagName === 'DIV') {
      onClose();
    }
  };

  return (
    <div className='media-modal pointer-events-auto fixed inset-0 z-[9999] h-full bg-gray-900/90'>
      <div
        className='absolute inset-0'
        role='presentation'
      >
        <Stack
          onClick={handleClickOutside}
          className={
            clsx('fixed inset-0 h-full grow transition-all', {
              'xl:pr-96': !isFullScreen,
              'xl:pr-0': isFullScreen,
            })
          }
          justifyContent='between'
        >
          <HStack
            alignItems='center'
            justifyContent='between'
            className={clsx('flex-[0_0_60px] p-4 transition-opacity', navigationHiddenClassName)}
          >
            <IconButton
              title={intl.formatMessage(messages.close)}
              src={require('@tabler/icons/x.svg')}
              onClick={onClose}
              theme='dark'
              className='!p-1.5 hover:scale-105 hover:bg-gray-900'
              iconClassName='h-5 w-5'
            />

            <HStack alignItems='center' space={2}>
              <IconButton
                src={require('@tabler/icons/download.svg')}
                theme='dark'
                className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                iconClassName='h-5 w-5'
                onClick={handleDownload}
              />

              {status && (
                <IconButton
                  src={isFullScreen ? require('@tabler/icons/arrows-minimize.svg') : require('@tabler/icons/arrows-maximize.svg')}
                  title={intl.formatMessage(isFullScreen ? messages.minimize : messages.expand)}
                  theme='dark'
                  className='hidden !p-1.5 hover:scale-105 hover:bg-gray-900 xl:block'
                  iconClassName='h-5 w-5'
                  onClick={() => setIsFullScreen(!isFullScreen)}
                />
              )}
            </HStack>
          </HStack>

          {/* Height based on height of top/bottom bars */}
          <div
            className='relative h-[calc(100vh-120px)] w-full grow'
          >
            {hasMultipleImages && (
              <div className={clsx('absolute inset-y-0 left-5 z-10 flex items-center transition-opacity', navigationHiddenClassName)}>
                <button
                  tabIndex={0}
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white'
                  onClick={handlePrevClick}
                  aria-label={intl.formatMessage(messages.previous)}
                >
                  <Icon src={require('@tabler/icons/arrow-left.svg')} className='h-5 w-5' />
                </button>
              </div>
            )}

            <ReactSwipeableViews
              style={swipeableViewsStyle}
              containerStyle={containerStyle}
              onChangeIndex={handleSwipe}
              index={getIndex()}
            >
              {content}
            </ReactSwipeableViews>

            {hasMultipleImages && (
              <div className={clsx('absolute inset-y-0 right-5 z-10 flex items-center transition-opacity', navigationHiddenClassName)}>
                <button
                  tabIndex={0}
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white'
                  onClick={handleNextClick}
                  aria-label={intl.formatMessage(messages.next)}
                >
                  <Icon src={require('@tabler/icons/arrow-right.svg')} className='h-5 w-5' />
                </button>
              </div>
            )}
          </div>

          {actualStatus && (
            <HStack
              justifyContent='center'
              className={clsx('flex-[0_0_60px] transition-opacity', navigationHiddenClassName)}
            >
              <StatusActionBar
                status={actualStatus}
                space='md'
                statusActionButtonTheme='inverse'
              />
            </HStack>
          )}
        </Stack>

        {actualStatus && (
          <div
            className={
              clsx('-right-96 hidden bg-white transition-all xl:fixed xl:inset-y-0 xl:right-0 xl:flex xl:w-96 xl:flex-col', {
                'xl:!-right-96': isFullScreen,
              })
            }
          >
            <Thread
              status={actualStatus}
              withMedia={false}
              useWindowScroll={false}
              itemClassName='px-4'
              next={next}
              handleLoadMore={handleLoadMore}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;
