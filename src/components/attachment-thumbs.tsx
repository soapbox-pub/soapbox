import React from 'react';

import { openModal } from 'soapbox/actions/modals';
import Bundle from 'soapbox/features/ui/components/bundle';
import { MediaGallery } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch } from 'soapbox/hooks';

import type { List as ImmutableList } from 'immutable';
import type { Attachment } from 'soapbox/types/entities';

interface IAttachmentThumbs {
  media: ImmutableList<Attachment>
  onClick?(): void
  sensitive?: boolean
}

const AttachmentThumbs = (props: IAttachmentThumbs) => {
  const { media, onClick, sensitive } = props;
  const dispatch = useAppDispatch();

  const renderLoading = () => <div className='media-gallery--compact' />;
  const onOpenMedia = (media: ImmutableList<Attachment>, index: number) => dispatch(openModal('MEDIA', { media, index }));

  return (
    <div className='attachment-thumbs'>
      <Bundle fetchComponent={MediaGallery} loading={renderLoading}>
        {(Component: any) => (
          <Component
            media={media}
            onOpenMedia={onOpenMedia}
            height={50}
            compact
            sensitive={sensitive}
            visible
          />
        )}
      </Bundle>

      {onClick && (
        <div className='attachment-thumbs__clickable-region' onClick={onClick} />
      )}
    </div>
  );
};

export default AttachmentThumbs;
