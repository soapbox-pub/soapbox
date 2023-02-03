import React from 'react';

import { ProgressBar } from 'soapbox/components/ui';

interface IChatPendingUpload {
  progress: number
}

/** Displays a loading thumbnail for an upload in the chat composer. */
const ChatPendingUpload: React.FC<IChatPendingUpload> = ({ progress }) => {
  return (
    <div className='relative p-4 inline-flex items-center justify-center w-24 h-24 rounded-lg overflow-hidden isolate bg-gray-200 dark:bg-primary-900'>
      <ProgressBar progress={progress} size='sm' />
    </div>
  );
};

export default ChatPendingUpload;