import classNames from 'clsx';
import React from 'react';

import { useAppSelector } from 'soapbox/hooks';

import SensitiveButton from './sensitive-button';
import Upload from './upload';
import UploadProgress from './upload-progress';

import type { Attachment as AttachmentEntity } from 'soapbox/types/entities';

interface IUploadForm {
  composeId: string,
}

const UploadForm: React.FC<IUploadForm> = ({ composeId }) => {
  const mediaIds = useAppSelector((state) => state.compose.get(composeId)!.media_attachments.map((item: AttachmentEntity) => item.id));
  const classes = classNames('compose-form__uploads-wrapper', {
    'contains-media': mediaIds.size !== 0,
  });

  return (
    <div className='compose-form__upload-wrapper'>
      <UploadProgress composeId={composeId} />

      <div className={classes}>
        {mediaIds.map((id: string) => (
          <Upload id={id} key={id} composeId={composeId} />
        ))}
      </div>

      {!mediaIds.isEmpty() && <SensitiveButton composeId={composeId} />}
    </div>
  );
};

export default UploadForm;
