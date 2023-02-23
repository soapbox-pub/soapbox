import React from 'react';

import { HStack, Textarea } from 'soapbox/components/ui';
import { Attachment } from 'soapbox/types/entities';

import ChatPendingUpload from './chat-pending-upload';
import ChatUpload from './chat-upload';

interface IChatTextarea extends React.ComponentProps<typeof Textarea> {
  attachments?: Attachment[]
  onDeleteAttachment?: (i: number) => void
  isUploading?: boolean
  uploadProgress?: number
}

/** Custom textarea for chats. */
const ChatTextarea: React.FC<IChatTextarea> = ({
  attachments,
  onDeleteAttachment,
  isUploading = false,
  uploadProgress = 0,
  ...rest
}) => {
  const handleDeleteAttachment = (i: number) => {
    return () => {
      if (onDeleteAttachment) {
        onDeleteAttachment(i);
      }
    };
  };

  return (
    <div className={`
      block
      w-full
      rounded-md border border-gray-400
      bg-white text-gray-900
      shadow-sm placeholder:text-gray-600
      focus-within:border-primary-500
      focus-within:ring-1 focus-within:ring-primary-500 dark:border-gray-800 dark:bg-gray-800
      dark:text-gray-100 dark:ring-1 dark:ring-gray-800 dark:placeholder:text-gray-600 dark:focus-within:border-primary-500
      dark:focus-within:ring-primary-500 sm:text-sm
    `}
    >
      {(!!attachments?.length || isUploading) && (
        <HStack className='-ml-2 -mt-2 p-3 pb-0' wrap>
          {attachments?.map((attachment, i) => (
            <div className='ml-2 mt-2 flex'>
              <ChatUpload
                key={attachment.id}
                attachment={attachment}
                onDelete={handleDeleteAttachment(i)}
              />
            </div>
          ))}

          {isUploading && (
            <div className='ml-2 mt-2 flex'>
              <ChatPendingUpload progress={uploadProgress} />
            </div>
          )}
        </HStack>
      )}

      <Textarea theme='transparent' {...rest} />
    </div>
  );
};

export default ChatTextarea;
