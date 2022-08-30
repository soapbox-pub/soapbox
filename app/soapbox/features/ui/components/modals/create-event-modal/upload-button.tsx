import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { IconButton } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';

import type { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  upload: { id: 'create_event.upload_banner', defaultMessage: 'Upload event banner' },
});

interface IUploadButton {
  disabled?: boolean,
  onSelectFile: (files: FileList) => void,
}

const UploadButton: React.FC<IUploadButton> = ({ disabled, onSelectFile }) => {
  const intl = useIntl();

  const fileElement = useRef<HTMLInputElement>(null);
  const attachmentTypes = useAppSelector(state => state.instance.configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>)?.filter(type => type.startsWith('image/'));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      onSelectFile(e.target.files);
    }
  };

  const handleClick = () => {
    fileElement.current?.click();
  };

  return (
    <div>
      <IconButton
        src={require('@tabler/icons/photo-plus.svg')}
        className='h-8 w-8 text-gray-600 hover:text-gray-700 dark:hover:text-gray-500'
        title={intl.formatMessage(messages.upload)}
        disabled={disabled}
        onClick={handleClick}
      />

      <label>
        <span className='sr-only'>{intl.formatMessage(messages.upload)}</span>
        <input
          ref={fileElement}
          type='file'
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
