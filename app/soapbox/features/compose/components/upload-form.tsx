import clsx from 'clsx';
import React from 'react';

import { useCompose } from 'soapbox/hooks';

import Upload from './upload';
import UploadProgress from './upload-progress';

import type { Attachment as AttachmentEntity } from 'soapbox/types/entities';

interface IUploadForm {
  composeId: string
}

const UploadForm: React.FC<IUploadForm> = ({ composeId }) => {
  const mediaIds = useCompose(composeId).media_attachments.map((item: AttachmentEntity) => item.id);
  const classes = clsx('compose-form__uploads-wrapper', {
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
    </div>
  );
};

export default UploadForm;
