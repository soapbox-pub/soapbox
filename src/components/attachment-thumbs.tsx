import { Suspense } from 'react';

import { openModal } from 'soapbox/actions/modals.ts';
import { MediaGallery } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import type { Attachment } from 'soapbox/types/entities.ts';

interface IAttachmentThumbs {
  media: Attachment[];
  onClick?(): void;
  sensitive?: boolean;
}

const AttachmentThumbs = (props: IAttachmentThumbs) => {
  const { media, onClick, sensitive } = props;
  const dispatch = useAppDispatch();

  const fallback = <div className='!h-[50px] bg-transparent' />;
  const onOpenMedia = (media: Attachment[], index: number) => dispatch(openModal('MEDIA', { media, index }));

  return (
    <div className='relative'>
      <Suspense fallback={fallback}>
        <MediaGallery
          media={media}
          onOpenMedia={onOpenMedia}
          height={50}
          compact
          sensitive={sensitive}
          visible
        />
      </Suspense>

      {onClick && (
        <button
          className='absolute inset-0 size-full cursor-pointer'
          onClick={onClick}
          style={{ background: 'none', border: 'none', padding: 0 }}
        />
      )}
    </div>
  );
};

export default AttachmentThumbs;