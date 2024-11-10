import { useCallback } from 'react';

import { undoUploadCompose, changeUploadCompose } from 'soapbox/actions/compose.ts';
import Upload from 'soapbox/components/upload.tsx';
import { useAppDispatch, useCompose, useInstance } from 'soapbox/hooks/index.ts';

interface IUploadCompose {
  id: string;
  composeId: string;
  onSubmit?(): void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
}

const UploadCompose: React.FC<IUploadCompose> = ({ composeId, id, onSubmit, onDragStart, onDragEnter, onDragEnd }) => {
  const dispatch = useAppDispatch();
  const { instance } = useInstance();
  const { pleroma: { metadata: { description_limit: descriptionLimit } } } = instance;

  const media = useCompose(composeId).media_attachments.find(item => item.id === id)!;

  const handleDescriptionChange = (description: string) => {
    dispatch(changeUploadCompose(composeId, media.id, { description }));
  };

  const handleDelete = () => {
    dispatch(undoUploadCompose(composeId, media.id));
  };

  const handleDragStart = useCallback(() => {
    onDragStart(id);
  }, [onDragStart, id]);

  const handleDragEnter = useCallback(() => {
    onDragEnter(id);
  }, [onDragEnter, id]);

  return (
    <Upload
      media={media}
      onDelete={handleDelete}
      onDescriptionChange={handleDescriptionChange}
      onSubmit={onSubmit}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragEnd={onDragEnd}
      descriptionLimit={descriptionLimit}
      withPreview
    />
  );
};

export default UploadCompose;
