import clsx from 'clsx';
import React from 'react';

import ExtensionBadge from '../extension-badge';

interface IMediaItemThumbnail extends Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'title'> {
  children: React.ReactNode
  pointer?: boolean
  ext?: string
}

const MediaItemThumbnail: React.FC<IMediaItemThumbnail> = ({
  children,
  pointer = false,
  ext,
  ...rest
}) => {
  return (
    <a
      className={clsx('media-gallery__item-thumbnail', {
        'cursor-pointer': pointer,
      })}
      target='_blank'
      {...rest}
    >
      {children}

      {ext && (
        <div className='pointer-events-none absolute left-2 bottom-2 opacity-90'>
          <ExtensionBadge ext={ext} />
        </div>
      )}
    </a>
  );
};

export default MediaItemThumbnail;