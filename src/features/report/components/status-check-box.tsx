import noop from 'lodash/noop';
import { Suspense } from 'react';

import { toggleStatusReport } from 'soapbox/actions/reports.ts';
import StatusContent from 'soapbox/components/status-content.tsx';
import { Toggle } from 'soapbox/components/ui/index.ts';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks/index.ts';

import { MediaGallery, Video, Audio } from '../../ui/util/async-components.ts';

interface IStatusCheckBox {
  id: string;
  disabled?: boolean;
}

const StatusCheckBox: React.FC<IStatusCheckBox> = ({ id, disabled }) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.statuses.get(id));
  const checked = useAppSelector((state) => state.reports.new.status_ids.includes(id));

  const onToggle: React.ChangeEventHandler<HTMLInputElement> = (e) => dispatch(toggleStatusReport(id, e.target.checked));

  if (!status || status.reblog) {
    return null;
  }

  let media;

  if (status.media_attachments.size > 0) {
    if (status.media_attachments.some(item => item.type === 'unknown')) {
      // Do nothing
    } else if (status.media_attachments.get(0)?.type === 'video') {
      const video = status.media_attachments.get(0);

      if (video) {
        media = (
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={video.meta.getIn(['original', 'aspect']) as number | undefined}
            width={239}
            height={110}
            inline
          />
        );
      }
    } else if (status.media_attachments.get(0)?.type === 'audio') {
      const audio = status.media_attachments.get(0);

      if (audio) {
        media = (
          <Audio
            src={audio.url}
            alt={audio.description}
          />
        );
      }
    } else {
      media = (
        <MediaGallery
          media={status.media_attachments}
          sensitive={status.sensitive}
          height={110}
          onOpenMedia={noop}
        />
      );
    }
  }

  return (
    <div className='status-check-box'>
      <div className='status-check-box__status'>
        <StatusContent status={status} />
        <Suspense>{media}</Suspense>
      </div>

      <div className='status-check-box-toggle'>
        <Toggle checked={checked} onChange={onToggle} disabled={disabled} />
      </div>
    </div>
  );
};

export default StatusCheckBox;
