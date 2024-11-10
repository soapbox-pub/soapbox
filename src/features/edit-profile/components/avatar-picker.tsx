import cameraPlusIcon from '@tabler/icons/outline/camera-plus.svg';
import clsx from 'clsx';
import { forwardRef, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from 'soapbox/components/ui/avatar.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import { useDraggedFiles } from 'soapbox/hooks/index.ts';

interface IMediaInput {
  className?: string;
  src: string | undefined;
  accept?: string;
  onChange: (files: FileList | null) => void;
  disabled?: boolean;
}

const AvatarPicker = forwardRef<HTMLInputElement, IMediaInput>(({ className, src, onChange, accept, disabled }, ref) => {
  const picker = useRef<HTMLLabelElement>(null);

  const { isDragging, isDraggedOver } = useDraggedFiles(picker, (files) => {
    onChange(files);
  });

  return (
    <label
      ref={picker}
      className={clsx(
        'absolute bottom-0 left-1/2 size-20 -translate-x-1/2 translate-y-1/2 cursor-pointer rounded-full bg-primary-300 ring-2',
        {
          'border-2 border-primary-600 border-dashed !z-[99] overflow-hidden': isDragging,
          'ring-white dark:ring-primary-900': !isDraggedOver,
          'ring-offset-2 ring-primary-600': isDraggedOver,
        },
        className,
      )}
      style={{ height: 80, width: 80 }}
    >
      {src && <Avatar src={src} size={80} />}
      <HStack
        alignItems='center'
        justifyContent='center'
        className={clsx('absolute left-0 top-0 size-full rounded-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-500': src,
        })}
      >
        <Icon
          src={cameraPlusIcon}
          className='size-5 text-white'
        />
      </HStack>
      <span className='sr-only'><FormattedMessage id='group.upload_avatar' defaultMessage='Upload avatar' /></span>
      <input
        ref={ref}
        name='avatar'
        type='file'
        accept={accept}
        onChange={({ target }) => onChange(target.files)}
        disabled={disabled}
        className='hidden'
      />
    </label>
  );
});

export default AvatarPicker;
