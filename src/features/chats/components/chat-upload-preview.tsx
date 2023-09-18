import React from 'react';

import { Icon } from 'soapbox/components/ui';
import { MIMETYPE_ICONS } from 'soapbox/components/upload';

import type { Attachment } from 'soapbox/types/entities';

const defaultIcon = require('@tabler/icons/paperclip.svg');

interface IChatUploadPreview {
  className?: string
  attachment: Attachment
}

/**
 * Displays a generic preview for an upload depending on its media type.
 * It fills its container and is expected to be sized by its parent.
 */
const ChatUploadPreview: React.FC<IChatUploadPreview> = ({ className, attachment }) => {
  const mimeType = attachment.pleroma.get('mime_type') as string | undefined;

  switch (attachment.type) {
    case 'image':
    case 'gifv':
      return (
        <img
          className='pointer-events-none h-full w-full object-cover'
          src={attachment.preview_url}
          alt=''
        />
      );
    case 'video':
      return (
        <video
          className='pointer-events-none h-full w-full object-cover'
          src={attachment.preview_url}
          autoPlay
          playsInline
          controls={false}
          muted
          loop
        />
      );
    default:
      return (
        <div className='pointer-events-none flex h-full w-full items-center justify-center'>
          <Icon
            className='mx-auto my-12 h-16 w-16 text-gray-800 dark:text-gray-200'
            src={MIMETYPE_ICONS[mimeType || ''] || defaultIcon}
          />
        </div>
      );
  }
};

export default ChatUploadPreview;