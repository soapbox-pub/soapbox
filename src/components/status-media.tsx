import { Suspense } from 'react';


import { openModal } from 'soapbox/actions/modals.ts';
import AttachmentThumbs from 'soapbox/components/attachment-thumbs.tsx';
import PreviewCard from 'soapbox/components/preview-card.tsx';
import { Entities, EntityTypes } from 'soapbox/entity-store/entities.ts';
import { GroupLinkPreview } from 'soapbox/features/groups/components/group-link-preview.tsx';
import PlaceholderCard from 'soapbox/features/placeholder/components/placeholder-card.tsx';
import { MediaGallery, Video, Audio } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { Attachment } from 'soapbox/schemas/index.ts';

interface IStatusMedia {
  /** Status entity to render media for. */
  status: EntityTypes[Entities.STATUSES];
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

  const size = status.media_attachments.length;
  const firstAttachment = status.media_attachments[0];

  let media: JSX.Element | null = null;

  const renderLoadingMediaGallery = (): JSX.Element => {
    return <div className='relative isolate box-border h-auto w-full overflow-hidden rounded-lg' style={{ height: '285px' }} />;
  };

  const renderLoadingVideoPlayer = (): JSX.Element => {
    return <div className='relative mt-2 block cursor-pointer border-0 bg-cover bg-center bg-no-repeat' style={{ height: '285px' }} />;
  };

  const renderLoadingAudioPlayer = (): JSX.Element => {
    return <div className='relative mt-2 block cursor-pointer border-0 bg-cover bg-center bg-no-repeat' style={{ height: '285px' }} />;
  };

  const openMedia = (media: readonly Attachment[], index: number) => {
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
            blurhash={video.blurhash ?? undefined}
            src={video.url}
            alt={video.description}
            aspectRatio={Number(video.meta?.original?.aspect)}
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
            poster={attachment.preview_url !== attachment.url ? attachment.preview_url : status.account.avatar_static}
            backgroundColor={attachment.meta?.colors?.background}
            foregroundColor={attachment.meta?.colors?.foreground}
            accentColor={attachment.meta?.colors?.accent}
            duration={attachment.meta?.duration  ?? 0}
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
