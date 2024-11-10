import { Suspense } from 'react';


import { openModal } from 'soapbox/actions/modals.ts';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs.tsx';
import PreviewCard from 'soapbox/components/preview-card.tsx';
import { GroupLinkPreview } from 'soapbox/features/groups/components/group-link-preview.tsx';
import PlaceholderCard from 'soapbox/features/placeholder/components/placeholder-card.tsx';
import { MediaGallery, Video, Audio } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import type { List as ImmutableList } from 'immutable';
import type { Status, Attachment } from 'soapbox/types/entities.ts';

interface IStatusMedia {
  /** Status entity to render media for. */
  status: Status;
  /** Whether to display compact media. */
  muted?: boolean;
  /** Callback when compact media is clicked. */
  onClick?: () => void;
  /** Whether or not the media is concealed behind a NSFW banner. */
  showMedia?: boolean;
  /** Callback when visibility is toggled (eg clicked through NSFW). */
  onToggleVisibility?: () => void;
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

  const size = status.media_attachments.size;
  const firstAttachment = status.media_attachments.first();

  let media: JSX.Element | null = null;

  const renderLoadingMediaGallery = (): JSX.Element => {
    return <div className='media_gallery' style={{ height: '285px' }} />;
  };

  const renderLoadingVideoPlayer = (): JSX.Element => {
    return <div className='media-spoiler-video' style={{ height: '285px' }} />;
  };

  const renderLoadingAudioPlayer = (): JSX.Element => {
    return <div className='media-spoiler-audio' style={{ height: '285px' }} />;
  };

  const openMedia = (media: ImmutableList<Attachment>, index: number) => {
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

      media = (
        <Suspense fallback={renderLoadingVideoPlayer()}>
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={Number(video.meta.getIn(['original', 'aspect']))}
            height={285}
            visible={showMedia}
            inline
          />
        </Suspense>
      );
    } else if (size === 1 && firstAttachment.type === 'audio') {
      const attachment = firstAttachment;

      media = (
        <Suspense fallback={renderLoadingAudioPlayer()}>
          <Audio
            src={attachment.url}
            alt={attachment.description}
            poster={attachment.preview_url !== attachment.url ? attachment.preview_url : status.getIn(['account', 'avatar_static']) as string | undefined}
            backgroundColor={attachment.meta.getIn(['colors', 'background']) as string | undefined}
            foregroundColor={attachment.meta.getIn(['colors', 'foreground']) as string | undefined}
            accentColor={attachment.meta.getIn(['colors', 'accent']) as string | undefined}
            duration={attachment.meta.getIn(['original', 'duration'], 0)  as number | undefined}
            height={263}
          />
        </Suspense>
      );
    } else {
      media = (
        <Suspense fallback={renderLoadingMediaGallery()}>
          <MediaGallery
            media={status.media_attachments}
            sensitive={status.sensitive}
            height={285}
            onOpenMedia={openMedia}
            visible={showMedia}
            onToggleVisibility={onToggleVisibility}
          />
        </Suspense>
      );
    }
  } else if (status.spoiler_text.length === 0 && !status.quote && status.card?.group) {
    media = (
      <GroupLinkPreview card={status.card} />
    );
  } else if (status.spoiler_text.length === 0 && !status.quote && status.card) {
    media = (
      <PreviewCard
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
