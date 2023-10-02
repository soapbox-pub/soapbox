import clsx from 'clsx';
import React, { useRef } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { HStack, Icon, IconButton, Text } from 'soapbox/components/ui';
import { useDraggedFiles } from 'soapbox/hooks';

const messages = defineMessages({
  title: { id: 'group.upload_banner.title', defaultMessage: 'Upload background picture' },
});

interface IMediaInput {
  src: string | undefined;
  accept?: string;
  onChange: (files: FileList | null) => void;
  onClear?: () => void;
  disabled?: boolean;
}

const HeaderPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({ src, onChange, onClear, accept, disabled }, ref) => {
  const intl = useIntl();

  const picker = useRef<HTMLLabelElement>(null);

  const { isDragging, isDraggedOver } = useDraggedFiles(picker, (files) => {
    onChange(files);
  });

  const handleClear: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    onClear!();
  };

  return (
    <label
      ref={picker}
      className={clsx(
        'dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-36 sm:shadow',
        {
          'border-2 border-primary-600 border-dashed !z-[99]': isDragging,
          'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
        },
      )}
      title={intl.formatMessage(messages.title)}
      tabIndex={0}
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
          onChange={({ target }) => onChange(target.files)}
          disabled={disabled}
          className='hidden'
        />
      </HStack>
      {onClear && src && (
        <IconButton
          onClick={handleClear}
          src={require('@tabler/icons/x.svg')}
          theme='dark'
          className='absolute right-2 top-2 z-10 hover:scale-105 hover:bg-gray-900'
          iconClassName='h-5 w-5'
        />
      )}
    </label>
  );
});

export default HeaderPicker;
