import React from 'react';

import UploadProgress from 'soapbox/components/upload-progress';
import { useAppSelector } from 'soapbox/hooks';

interface IComposeUploadProgress {
  composeId: string,
}

/** File upload progress bar for post composer. */
const ComposeUploadProgress: React.FC<IComposeUploadProgress> = ({ composeId }) => {
  const active = useAppSelector((state) => state.compose.get(composeId)!.is_uploading);
  const progress = useAppSelector((state) => state.compose.get(composeId)!.progress);

  if (!active) {
    return null;
  }

  return (
    <UploadProgress progress={progress} />
  );
};

export default ComposeUploadProgress;
