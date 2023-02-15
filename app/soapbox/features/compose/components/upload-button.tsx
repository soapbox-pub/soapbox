import React, { useRef } from 'react';
import { defineMessages, IntlShape, useIntl } from 'react-intl';

import { IconButton } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks';

import type { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  upload: { id: 'upload_button.label', defaultMessage: 'Add media attachment' },
});

const onlyImages = (types: ImmutableList<string>) => {
  return Boolean(types && types.every(type => type.startsWith('image/')));
};

export interface IUploadButton {
  disabled?: boolean
  unavailable?: boolean
  onSelectFile: (files: FileList, intl: IntlShape) => void
  style?: React.CSSProperties
  resetFileKey: number | null
  className?: string
  iconClassName?: string
  icon?: string
}

const UploadButton: React.FC<IUploadButton> = ({
  disabled = false,
  unavailable = false,
  onSelectFile,
  resetFileKey,
  className = 'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500',
  iconClassName,
  icon,
}) => {
  const intl = useIntl();
  const { configuration } = useInstance();

  const fileElement = useRef<HTMLInputElement>(null);
  const attachmentTypes = configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      onSelectFile(e.target.files, intl);
    }
  };

  const handleClick = () => {
    fileElement.current?.click();
  };

  if (unavailable) {
    return null;
  }

  const src = icon || (
    onlyImages(attachmentTypes)
      ? require('@tabler/icons/photo.svg')
      : require('@tabler/icons/paperclip.svg')
  );

  return (
    <div>
      <IconButton
        src={src}
        className={className}
        iconClassName={iconClassName}
        title={intl.formatMessage(messages.upload)}
        disabled={disabled}
        onClick={handleClick}
      />

      <label>
        <span className='sr-only'>{intl.formatMessage(messages.upload)}</span>
        <input
          key={resetFileKey}
          ref={fileElement}
          type='file'
          multiple
          accept={attachmentTypes && attachmentTypes.toArray().join(',')}
          onChange={handleChange}
          disabled={disabled}
          className='hidden'
        />
      </label>
    </div>
  );
};

export default UploadButton;
