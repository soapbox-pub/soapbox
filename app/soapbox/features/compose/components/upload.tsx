import React from 'react';
import { useHistory } from 'react-router-dom';

import { undoUploadCompose, changeUploadCompose, submitCompose } from 'soapbox/actions/compose';
import Upload from 'soapbox/components/upload';
import { useAppDispatch, useCompose, useInstance } from 'soapbox/hooks';

interface IUploadCompose {
  id: string
  composeId: string
}

const UploadCompose: React.FC<IUploadCompose> = ({ composeId, id }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { description_limit: descriptionLimit } = useInstance();

  const media = useCompose(composeId).media_attachments.find(item => item.id === id)!;

  const handleSubmit = () => {
    dispatch(submitCompose(composeId, history));
  };

  const handleDescriptionChange = (description: string) => {
    dispatch(changeUploadCompose(composeId, media.id, { description }));
  };

  const handleDelete = () => {
    dispatch(undoUploadCompose(composeId, media.id));
  };

  return (
    <Upload
      media={media}
      onDelete={handleDelete}
      onDescriptionChange={handleDescriptionChange}
      onSubmit={handleSubmit}
      descriptionLimit={descriptionLimit}
      withPreview
    />
  );
};

export default UploadCompose;
