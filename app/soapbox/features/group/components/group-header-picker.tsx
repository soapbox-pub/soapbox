import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { HStack, Text } from 'soapbox/components/ui';

interface IMediaInput {
  src: string | undefined
  accept: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

const HeaderPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({ src, onChange, accept, disabled }, ref) => {
  return (
    <label
      className='dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-36 sm:shadow'
    >
      {src && <img className='h-full w-full object-cover' src={src} alt='' />}
      <HStack
        className={clsx('absolute top-0 h-full w-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-100 dark:bg-gray-800': src,
        })}
        space={1.5}
        alignItems='center'
        justifyContent='center'
      >
        <Icon
          src={require('@tabler/icons/photo-plus.svg')}
          className='h-4.5 w-4.5'
        />

        <Text size='md' theme='primary' weight='semibold'>
          <FormattedMessage id='group.upload_banner' defaultMessage='Upload photo' />
        </Text>

        <input
          ref={ref}
          name='header'
          type='file'
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          className='hidden'
        />
      </HStack>
    </label>
  );
});

export default HeaderPicker;