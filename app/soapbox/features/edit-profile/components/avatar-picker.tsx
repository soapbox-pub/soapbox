import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Avatar, Icon, HStack } from 'soapbox/components/ui';

interface IMediaInput {
  className?: string
  src: string | undefined
  accept: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

const AvatarPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({ className, src, onChange, accept, disabled }, ref) => {
  return (
    <label
      className={clsx(
        'absolute bottom-0 left-1/2 h-20 w-20 -translate-x-1/2 translate-y-1/2 cursor-pointer rounded-full bg-primary-500 ring-2 ring-white dark:ring-primary-900',
        className,
      )}
    >
      {src && <Avatar src={src} size={80} />}
      <HStack
        alignItems='center'
        justifyContent='center'

        className={clsx('absolute left-0 top-0 h-full w-full rounded-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-500': src,
        })}
      >
        <Icon
          src={require('@tabler/icons/camera-plus.svg')}
          className='h-5 w-5 text-white'
        />
      </HStack>
      <span className='sr-only'><FormattedMessage id='group.upload_avatar' defaultMessage='Upload avatar' /></span>
      <input
        ref={ref}
        name='avatar'
        type='file'
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className='hidden'
      />
    </label>
  );
});

export default AvatarPicker;
