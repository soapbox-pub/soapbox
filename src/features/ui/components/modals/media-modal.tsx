import arrowLeftIcon from '@tabler/icons/outline/arrow-left.svg';
import arrowRightIcon from '@tabler/icons/outline/arrow-right.svg';
import arrowsMaximizeIcon from '@tabler/icons/outline/arrows-maximize.svg';
import arrowsMinimizeIcon from '@tabler/icons/outline/arrows-minimize.svg';
import downloadIcon from '@tabler/icons/outline/download.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { debounce } from 'es-toolkit';
import { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import ReactSwipeableViews from 'react-swipeable-views';

import { fetchNext, fetchStatusWithContext } from 'soapbox/actions/statuses.ts';
import ExtendedVideoPlayer from 'soapbox/components/extended-video-player.tsx';
import MissingIndicator from 'soapbox/components/missing-indicator.tsx';
import StatusActionBar from 'soapbox/components/status-action-bar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Audio from 'soapbox/features/audio/index.tsx';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status.tsx';
import Thread from 'soapbox/features/status/components/thread.tsx';
import Video from 'soapbox/features/video/index.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { userTouching } from 'soapbox/is-mobile.ts';
import { normalizeStatus } from 'soapbox/normalizers/index.ts';
import { Status as StatusEntity, Attachment } from 'soapbox/schemas/index.ts';
import { Status as LegacyStatus } from 'soapbox/types/entities.ts';
import { getActualStatus } from 'soapbox/utils/status.ts';

import ImageLoader from '../image-loader.tsx';

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
  media: readonly Attachment[];
  status?: StatusEntity;
  index: number;
  time?: number;
  onClose(): void;
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

  const actualStatus = status ? getActualStatus(status) : undefined;

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [next, setNext] = useState<string>();
  const [index, setIndex] = useState<number | null>(null);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!status);

  const hasMultipleImages = media.length > 1;

  const handleSwipe = (index: number) => setIndex(index % media.length);
  const handleNextClick = () => setIndex((getIndex() + 1) % media.length);
  const handlePrevClick = () => setIndex((media.length + getIndex() - 1) % media.length);

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
    const mediaItem = hasMultipleImages ? media[index as number] : media[0];
    window.open(mediaItem?.url);
  };

  const getIndex = () => index !== null ? index : props.index;

  const toggleNavigation = () => {
    setNavigationHidden(value => !value && userTouching.matches);
  };

  const handleStatusClick: React.MouseEventHandler = e => {
    if (status && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      history.push(`/@${status.account.acct}/posts/${status?.id}`);
      onClose();
    }
  };

  const content = media.map((attachment, i) => {
    const width  = 'meta' in attachment && 'original' in attachment.meta ? (attachment)?.meta?.original?.width : undefined;
    const height = 'meta' in attachment && 'original' in attachment.meta ? (attachment)?.meta?.original?.height : undefined;

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
          blurhash={attachment.blurhash ?? undefined}
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
          poster={attachment.preview_url !== attachment.url ? attachment.preview_url : status?.account.avatar_static}
          backgroundColor={attachment.meta?.colors?.background}
          foregroundColor={attachment.meta?.colors?.foreground}
          accentColor={attachment.meta?.colors?.accent}
          duration={attachment?.meta?.duration ?? 0}
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
  });

  const handleLoadMore = useCallback(debounce(() => {
    if (next && status) {
      dispatch(fetchNext(status?.id, next)).then(({ next }) => {
        setNext(next);
      }).catch(() => { });
    }
  }, 300, { edges: ['leading'] }), [next, status]);

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
    <div className='media-modal pointer-events-auto fixed inset-0 z-[9999] flex size-full bg-gray-900/90'>
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
          <Stack className='relative h-full'>
            <HStack
              alignItems='center'
              justifyContent='between'
              className={clsx('absolute z-[9999] flex w-full p-4 transition-opacity', navigationHiddenClassName)}
            >
              <IconButton
                title={intl.formatMessage(messages.close)}
                src={xIcon}
                onClick={onClose}
                theme='dark'
                className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                iconClassName='h-5 w-5'
              />

              <HStack alignItems='center' space={2}>
                <IconButton
                  src={downloadIcon}
                  theme='dark'
                  className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  onClick={handleDownload}
                />

                {status && (
                  <IconButton
                    src={isFullScreen ? arrowsMinimizeIcon : arrowsMaximizeIcon}
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
                    className='flex size-10 items-center justify-center rounded-full bg-gray-900 text-white'
                    onClick={handlePrevClick}
                    aria-label={intl.formatMessage(messages.previous)}
                  >
                    <Icon src={arrowLeftIcon} className='size-5' />
                  </button>
                </div>
              )}

              <div className='size-full'>
                <ReactSwipeableViews
                  style={swipeableViewsStyle}
                  containerStyle={containerStyle}
                  onChangeIndex={handleSwipe}
                  className='flex items-center justify-center'
                  index={getIndex()}
                >
                  {content}
                </ReactSwipeableViews>
              </div>

              {hasMultipleImages && (
                <div className={clsx('absolute inset-y-0 right-5 z-10 flex items-center transition-opacity', navigationHiddenClassName)}>
                  <button
                    tabIndex={0}
                    className='flex size-10 items-center justify-center rounded-full bg-gray-900 text-white'
                    onClick={handleNextClick}
                    aria-label={intl.formatMessage(messages.next)}
                  >
                    <Icon src={arrowRightIcon} className='size-5' />
                  </button>
                </div>
              )}
            </div>

            {actualStatus && (
              <HStack
                justifyContent='center'
                className={clsx('absolute bottom-2 flex w-full transition-opacity', navigationHiddenClassName)}
              >
                <StatusActionBar
                  status={normalizeStatus(actualStatus) as LegacyStatus}
                  space='md'
                  statusActionButtonTheme='inverse'
                />
              </HStack>
            )}
          </Stack>
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
              status={normalizeStatus(actualStatus) as LegacyStatus}
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
