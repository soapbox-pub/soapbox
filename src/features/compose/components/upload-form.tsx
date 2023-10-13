import clsx from 'clsx';
import React from 'react';

import { HStack } from 'soapbox/components/ui';
import { useCompose } from 'soapbox/hooks';

import Upload from './upload';
import UploadProgress from './upload-progress';

import type { Attachment as AttachmentEntity } from 'soapbox/types/entities';

interface IUploadForm {
  composeId: string;
  onSubmit(): void;
}

const UploadForm: React.FC<IUploadForm> = ({ composeId, onSubmit }) => {
  const mediaIds = useCompose(composeId).media_attachments.map((item: AttachmentEntity) => item.id);

  return (
    <div className='overflow-hidden'>
      <UploadProgress composeId={composeId} />

      <HStack wrap className={clsx('overflow-hidden', mediaIds.size !== 0 && 'p-1')}>
        {mediaIds.map((id: string) => (
          <Upload id={id} key={id} composeId={composeId} onSubmit={onSubmit} />
        ))}
      </HStack>
    </div>
  );
};

export default UploadForm;
