import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import React from 'react';

import { openModal } from 'soapbox/actions/modals';
import Blurhash from 'soapbox/components/blurhash';
import { Icon } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import ChatUploadPreview from './chat-upload-preview';

import type { Attachment } from 'soapbox/types/entities';

interface IChatUpload {
  attachment: Attachment
  onDelete?(): void
}

/** An attachment uploaded to the chat composer, before sending. */
const ChatUpload: React.FC<IChatUpload> = ({ attachment, onDelete }) => {
  const dispatch = useAppDispatch();
  const clickable = attachment.type !== 'unknown';

  const handleOpenModal = () => {
    dispatch(openModal('MEDIA', { media: ImmutableList.of(attachment), index: 0 }));
  };

  return (
    <div className='relative isolate inline-block h-24 w-24 overflow-hidden rounded-lg bg-gray-200 dark:bg-primary-900'>
      <Blurhash hash={attachment.blurhash} className='absolute inset-0 -z-10 h-full w-full' />

      <div className='absolute right-[6px] top-[6px]'>
        <RemoveButton onClick={onDelete} />
      </div>

      <button
        onClick={clickable ? handleOpenModal : undefined}
        className={clsx('h-full w-full', { 'cursor-zoom-in': clickable, 'cursor-default': !clickable })}
      >
        <ChatUploadPreview attachment={attachment} />
      </button>
    </div>
  );
};

interface IRemoveButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** Floating button to remove an attachment. */
const RemoveButton: React.FC<IRemoveButton> = ({ onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 p-1'
    >
      <Icon
        className='h-3 w-3 text-white'
        src={require('@tabler/icons/x.svg')}
      />
    </button>
  );
};

export default ChatUpload;