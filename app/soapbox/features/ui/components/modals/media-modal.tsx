import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import ReactSwipeableViews from 'react-swipeable-views';

import ExtendedVideoPlayer from 'soapbox/components/extended-video-player';
import Icon from 'soapbox/components/icon';
import IconButton from 'soapbox/components/icon-button';
import Audio from 'soapbox/features/audio';
import Video from 'soapbox/features/video';
import { useAppDispatch } from 'soapbox/hooks';

import ImageLoader from '../image-loader';

import type { List as ImmutableList } from 'immutable';
import type { Attachment, Status } from 'soapbox/types/entities';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
});

interface IMediaModal {
  media: ImmutableList<Attachment>
  status?: Status
  index: number
  time?: number
  onClose: () => void
}

const MediaModal: React.FC<IMediaModal> = (props) => {
  const {
    media,
    status,
    onClose,
    time = 0,
  } = props;

  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [index, setIndex] = useState<number | null>(null);
  const [navigationHidden, setNavigationHidden] = useState(false);

  const handleSwipe = (index: number) => {
    setIndex(index % media.size);
  };

  const handleNextClick = () => {
    setIndex((getIndex() + 1) % media.size);
  };

  const handlePrevClick = () => {
    setIndex((media.size + getIndex() - 1) % media.size);
  };

  const handleChangeIndex: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const index = Number(e.currentTarget.getAttribute('data-index'));
    setIndex(index % media.size);
  };

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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [index]);

  const getIndex = () => index !== null ? index : props.index;

  const toggleNavigation = () => {
    setNavigationHidden(!navigationHidden);
  };

  const handleStatusClick: React.MouseEventHandler = e => {
    if (status && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();

      dispatch((_, getState) => {
        const account = typeof status.account === 'string' ? getState().accounts.get(status.account) : status.account;
        if (!account) return;

        history.push(`/@${account.acct}/posts/${status?.id}`);
        onClose();
      });
    }
  };

  const handleCloserClick: React.MouseEventHandler = ({ target }) => {
    const whitelist = ['zoomable-image'];
    const activeSlide = document.querySelector('.media-modal .react-swipeable-view-container > div[aria-hidden="false"]');

    const isClickOutside = target === activeSlide || !activeSlide?.contains(target as Element);
    const isWhitelisted = whitelist.some(w => (target as Element).classList.contains(w));

    if (isClickOutside || isWhitelisted) {
      onClose();
    }
  };

  let pagination: React.ReactNode[] = [];

  const leftNav = media.size > 1 && (
    <button
      tabIndex={0}
      className='media-modal__nav media-modal__nav--left'
      onClick={handlePrevClick}
      aria-label={intl.formatMessage(messages.previous)}
    >
      <Icon src={require('@tabler/icons/arrow-left.svg')} />
    </button>
  );

  const rightNav = media.size > 1 && (
    <button
      tabIndex={0}
      className='media-modal__nav  media-modal__nav--right'
      onClick={handleNextClick}
      aria-label={intl.formatMessage(messages.next)}
    >
      <Icon src={require('@tabler/icons/arrow-right.svg')} />
    </button>
  );

  if (media.size > 1) {
    pagination = media.toArray().map((item, i) => (
      <li className='media-modal__page-dot' key={i}>
        <button
          tabIndex={0}
          className={clsx('media-modal__button', {
            'media-modal__button--active': i === getIndex(),
          })}
          onClick={handleChangeIndex}
          data-index={i}
        >
          {i + 1}
        </button>
      </li>
    ));
  }

  const isMultiMedia = media.map((image) => image.type !== 'image').toArray();

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

  const navigationClassName = clsx('media-modal__navigation', {
    'media-modal__navigation--hidden': navigationHidden,
  });

  return (
    <div className='modal-root__modal media-modal'>
      <div
        className='media-modal__closer'
        role='presentation'
        onClick={handleCloserClick}
      >
        <ReactSwipeableViews
          style={swipeableViewsStyle}
          containerStyle={containerStyle}
          onChangeIndex={handleSwipe}
          index={getIndex()}
        >
          {content}
        </ReactSwipeableViews>
      </div>

      <div className={navigationClassName}>
        <IconButton
          className='media-modal__close'
          title={intl.formatMessage(messages.close)}
          src={require('@tabler/icons/x.svg')}
          onClick={onClose}
        />

        {leftNav}
        {rightNav}

        {(status && !isMultiMedia[getIndex()]) && (
          <div className={clsx('media-modal__meta', { 'media-modal__meta--shifted': media.size > 1 })}>
            <a href={status.url} onClick={handleStatusClick}>
              <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
            </a>
          </div>
        )}

        <ul className='media-modal__pagination'>
          {pagination}
        </ul>
      </div>
    </div>
  );
};

export default MediaModal;
