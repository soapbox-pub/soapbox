import React from 'react';

import UploadProgress from 'soapbox/components/upload-progress';
import { useCompose } from 'soapbox/hooks';

interface IComposeUploadProgress {
  composeId: string
}

/** File upload progress bar for post composer. */
const ComposeUploadProgress: React.FC<IComposeUploadProgress> = ({ composeId }) => {
  const compose = useCompose(composeId);

  const active = compose.is_uploading;
  const progress = compose.progress;

  if (!active) {
    return null;
  }

  return (
    <UploadProgress progress={progress} />
  );
};

export default ComposeUploadProgress;
