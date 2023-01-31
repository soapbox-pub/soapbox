import clsx from 'clsx';
import React from 'react';

interface IMediaItemThumbnail extends Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'title'> {
  children: React.ReactNode
  pointer?: boolean
}

const MediaItemThumbnail: React.FC<IMediaItemThumbnail> = ({
  children,
  pointer = false,
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
    </a>
  );
};

export default MediaItemThumbnail;