import React from 'react';

import { Textarea } from 'soapbox/components/ui';
import { Attachment } from 'soapbox/types/entities';

interface IChatTextarea extends React.ComponentProps<typeof Textarea> {
  attachments?: Attachment[]
}

/** Custom textarea for chats. */
const ChatTextarea: React.FC<IChatTextarea> = ({ attachments, ...rest }) => {
  return (
    <div className={`
      bg-white
      dark:bg-transparent
      shadow-sm block w-full
      sm:text-sm rounded-md
      text-gray-900 dark:text-gray-100
      border-1
      placeholder:text-gray-600 dark:placeholder:text-gray-600 border-gray-400 dark:border-gray-800
      dark:ring-1 dark:ring-gray-800 focus-within:ring-primary-500 focus-within:border-primary-500
      dark:focus-within:ring-primary-500 dark:focus-within:border-primary-500
    `}
    >
      {attachments?.map(attachment => (
        <img
          className='w-8 h-8'
          key={attachment.id}
          src={attachment.url}
          alt=''
        />
      ))}

      <Textarea theme='transparent' {...rest} />
    </div>
  );
};

export default ChatTextarea;