import { AxiosError } from 'axios';
import clsx from 'clsx';
import React, { MutableRefObject, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { uploadMedia } from 'soapbox/actions/media';
import { Stack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';
import { IChat, useChatActions } from 'soapbox/queries/chats';
import toast from 'soapbox/toast';

import ChatComposer from './chat-composer';
import ChatMessageList from './chat-message-list';

import type { Attachment } from 'soapbox/types/entities';

const fileKeyGen = (): number => Math.floor((Math.random() * 0x10000));

const messages = defineMessages({
  failedToSend: { id: 'chat.failed_to_send', defaultMessage: 'Message failed to send.' },
  uploadErrorLimit: { id: 'upload_error.limit', defaultMessage: 'File upload limit exceeded.' },
});

interface ChatInterface {
  chat: IChat
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>
  className?: string
}

/**
 * Clears the value of the input while dispatching the `onChange` function
 * which allows the <Textarea> to resize itself (this is important)
 * because we autoGrow the element as the user inputs text that spans
 * beyond one line
 */
const clearNativeInputValue = (element: HTMLTextAreaElement) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, '');

    const ev2 = new Event('input', { bubbles: true });
    element.dispatchEvent(ev2);
  }
};

/**
 * Chat UI with just the messages and textarea.
 * Reused between floating desktop chats and fullscreen/mobile chats.
 */
const Chat: React.FC<ChatInterface> = ({ chat, inputRef, className }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { createChatMessage, acceptChat } = useChatActions(chat.id);
  const attachmentLimit = useAppSelector(state => state.instance.configuration.getIn(['chats', 'max_media_attachments']) as number);

  const [content, setContent] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resetContentKey, setResetContentKey] = useState<number>(fileKeyGen());
  const [resetFileKey, setResetFileKey] = useState<number>(fileKeyGen());
  const [errorMessage, setErrorMessage] = useState<string>();

  const isSubmitDisabled = content.length === 0 && attachments.length === 0;

  const submitMessage = () => {
    createChatMessage.mutate({ chatId: chat.id, content, mediaIds: attachments.map(a => a.id) }, {
      onSuccess: () => {
        setErrorMessage(undefined);
      },
      onError: (error: AxiosError<{ error: string }>, _variables, context) => {
        const message = error.response?.data?.error;
        setErrorMessage(message || intl.formatMessage(messages.failedToSend));
        setContent(context.prevContent as string);
      },
    });

    clearState();
  };

  const clearState = () => {
    if (inputRef?.current) {
      clearNativeInputValue(inputRef.current);
    }
    setContent('');
    setAttachments([]);
    setUploadCount(0);
    setUploadProgress(0);
    setResetFileKey(fileKeyGen());
    setResetContentKey(fileKeyGen());
  };

  const sendMessage = () => {
    if (!isSubmitDisabled && !createChatMessage.isLoading) {
      submitMessage();

      if (!chat.accepted) {
        acceptChat.mutate();
      }
    }
  };

  const insertLine = () => setContent(content + '\n');

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    markRead();

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      insertLine();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleContentChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setContent(event.target.value);
  };

  const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (isSubmitDisabled && e.clipboardData && e.clipboardData.files.length === 1) {
      handleFiles(e.clipboardData.files);
    }
  };

  const markRead = () => {
    // markAsRead.mutate();
    // dispatch(markChatRead(chatId));
  };

  const handleMouseOver = () => markRead();

  const handleRemoveFile = (i: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(i, 1);
    setAttachments(newAttachments);
    setResetFileKey(fileKeyGen());
  };

  const onUploadProgress = (e: ProgressEvent) => {
    const { loaded, total } = e;
    setUploadProgress(loaded / total);
  };

  const handleFiles = (files: FileList) => {
    if (files.length + attachments.length > attachmentLimit) {
      toast.error(messages.uploadErrorLimit);
      return;
    }

    setUploadCount(files.length);

    const promises = Array.from(files).map(async(file) => {
      const data = new FormData();
      data.append('file', file);
      const response = await dispatch(uploadMedia(data, onUploadProgress));
      return normalizeAttachment(response.data);
    });

    return Promise.all(promises)
      .then((newAttachments) => {
        setAttachments([...attachments, ...newAttachments]);
        setUploadCount(0);
      })
      .catch(() => setUploadCount(0));
  };

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [chat.id, inputRef?.current]);

  return (
    <Stack className={clsx('flex grow overflow-hidden', className)} onMouseOver={handleMouseOver}>
      <div className='flex h-full grow justify-center overflow-hidden'>
        <ChatMessageList chat={chat} />
      </div>

      <ChatComposer
        ref={inputRef}
        onKeyDown={handleKeyDown}
        value={content}
        onChange={handleContentChange}
        onSubmit={sendMessage}
        errorMessage={errorMessage}
        onSelectFile={handleFiles}
        resetFileKey={resetFileKey}
        resetContentKey={resetContentKey}
        onPaste={handlePaste}
        attachments={attachments}
        onDeleteAttachment={handleRemoveFile}
        uploadCount={uploadCount}
        uploadProgress={uploadProgress}
      />
    </Stack>
  );
};

export default Chat;
