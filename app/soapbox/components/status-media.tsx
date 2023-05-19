import React, { useState } from 'react';

import { openModal } from 'soapbox/actions/modals';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs';
import { GroupLinkPreview } from 'soapbox/features/groups/components/group-link-preview';
import PlaceholderCard from 'soapbox/features/placeholder/components/placeholder-card';
import Card from 'soapbox/features/status/components/card';
import Bundle from 'soapbox/features/ui/components/bundle';
import { MediaGallery, Video, Audio } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useSettings } from 'soapbox/hooks';
import { addAutoPlay } from 'soapbox/utils/media';

import type VideoType from 'soapbox/features/video';
import type { Status, Attachment } from 'soapbox/schemas';

interface IStatusMedia {
  /** Status entity to render media for. */
  status: Status
  /** Whether to display compact media. */
  muted?: boolean
  /** Callback when compact media is clicked. */
  onClick?: () => void
  /** Whether or not the media is concealed behind a NSFW banner. */
  showMedia?: boolean
  /** Callback when visibility is toggled (eg clicked through NSFW). */
  onToggleVisibility?: () => void
}

/** Render media attachments for a status. */
const StatusMedia: React.FC<IStatusMedia> = ({
  status,
  muted = false,
  onClick,
  showMedia = true,
  onToggleVisibility = () => { },
}) => {
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const shouldAutoPlayVideo = settings.get('autoPlayVideo');

  const [mediaWrapperWidth, setMediaWrapperWidth] = useState<number | undefined>(undefined);

  const size = status.media_attachments.length;
  const [firstAttachment] = status.media_attachments;

  let media: JSX.Element | null = null;

  const setRef = (c: HTMLDivElement): void => {
    if (c) {
      setMediaWrapperWidth(c.offsetWidth);
    }
  };

  const renderLoadingMediaGallery = (): JSX.Element => {
    return <div className='media_gallery' style={{ height: '285px' }} />;
  };

  const renderLoadingVideoPlayer = (): JSX.Element => {
    return <div className='media-spoiler-video' style={{ height: '285px' }} />;
  };

  const renderLoadingAudioPlayer = (): JSX.Element => {
    return <div className='media-spoiler-audio' style={{ height: '285px' }} />;
  };

  const openMedia = (media: Attachment[], index: number) => {
    dispatch(openModal('MEDIA', { media, status, index }));
  };

  if (size > 0 && firstAttachment) {
    if (muted) {
      media = (
        <AttachmentThumbs
          media={status.media_attachments}
          onClick={onClick}
          sensitive={status.sensitive}
        />
      );
    } else if (size === 1 && firstAttachment.type === 'video') {
      const video = firstAttachment;

      if (video.external_video_id && status.card) {
        const getHeight = (): number | undefined => {
          const width = video.meta.original?.width;
          const height = video.meta.original?.height;
          if (typeof width === 'number' && typeof height === 'number' && typeof mediaWrapperWidth === 'number') {
            return mediaWrapperWidth / (width / height);
          }
        };

        const height = getHeight();

        media = (
          <div className='status-card horizontal compact interactive status-card--video'>
            <div
              ref={setRef}
              className='status-card__image status-card-video'
              style={height ? { height } : undefined}
              dangerouslySetInnerHTML={{
                __html: shouldAutoPlayVideo ? addAutoPlay(status.card.html) : status.card.html,
              }}
            />
          </div>
        );
      } else {
        media = (
          <Bundle fetchComponent={Video} loading={renderLoadingVideoPlayer}>
            {(Component: typeof VideoType) => (
              <Component
                preview={video.preview_url}
                blurhash={video.blurhash}
                src={video.url}
                alt={video.description}
                aspectRatio={video.meta.original?.aspect}
                height={285}
                visible={showMedia}
                inline
              />
            )}
          </Bundle>
        );
      }
    } else if (size === 1 && firstAttachment.type === 'audio') {
      const attachment = firstAttachment;

      media = (
        <Bundle fetchComponent={Audio} loading={renderLoadingAudioPlayer}>
          {(Component: any) => (
            <Component
              src={attachment.url}
              alt={attachment.description}
              poster={attachment.preview_url !== attachment.url ? attachment.preview_url : status.account.avatar_static}
              backgroundColor={attachment.meta.colors?.background}
              foregroundColor={attachment.meta.colors?.foreground}
              accentColor={attachment.meta.colors?.accent}
              duration={attachment.meta?.duration}
              height={263}
            />
          )}
        </Bundle>
      );
    } else {
      media = (
        <Bundle fetchComponent={MediaGallery} loading={renderLoadingMediaGallery}>
          {(Component: any) => (
            <Component
              media={status.media_attachments}
              sensitive={status.sensitive}
              height={285}
              onOpenMedia={openMedia}
              visible={showMedia}
              onToggleVisibility={onToggleVisibility}
            />
          )}
        </Bundle>
      );
    }
  } else if (status.spoiler_text.length === 0 && !status.quote && status.card?.group) {
    media = (
      <GroupLinkPreview card={status.card} />
    );
  } else if (status.spoiler_text.length === 0 && !status.quote && status.card) {
    media = (
      <Card
        onOpenMedia={openMedia}
        card={status.card}
        compact
      />
    );
  } else if (status.expectsCard) {
    media = (
      <PlaceholderCard />
    );
  }

  if (media) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onClick={e => e.stopPropagation()}>
        {media}
      </div>
    );
  } else {
    return null;
  }
};

export default StatusMedia;
