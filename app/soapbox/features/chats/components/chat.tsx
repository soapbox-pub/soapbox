import { useMutation } from '@tanstack/react-query';
import classNames from 'clsx';
import React, { MutableRefObject, useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { uploadMedia } from 'soapbox/actions/media';
import { HStack, IconButton, Stack, Text, Textarea } from 'soapbox/components/ui';
import UploadProgress from 'soapbox/components/upload-progress';
import UploadButton from 'soapbox/features/compose/components/upload_button';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';
import { chatKeys, IChat, useChat } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { truncateFilename } from 'soapbox/utils/media';

import ChatMessageList from './chat-message-list';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Type a message' },
  send: { id: 'chat.actions.send', defaultMessage: 'Send' },
  failedToSend: { id: 'chat.failed_to_send', defaultMessage: 'Message failed to send.' },
  retry: { id: 'chat.retry', defaultMessage: 'Retry?' },
});

const fileKeyGen = (): number => Math.floor((Math.random() * 0x10000));

interface ChatInterface {
  chat: IChat,
  autosize?: boolean,
  inputRef?: MutableRefObject<HTMLTextAreaElement>,
  className?: string,
}

/**
 * Chat UI with just the messages and textarea.
 * Reused between floating desktop chats and fullscreen/mobile chats.
 */
const Chat: React.FC<ChatInterface> = ({ chat, autosize, inputRef, className }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useOwnAccount();

  const { createChatMessage, acceptChat } = useChat(chat.id);

  const [content, setContent] = useState<string>('');
  const [attachment, setAttachment] = useState<any>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resetFileKey, setResetFileKey] = useState<number>(fileKeyGen());
  const [hasErrorSubmittingMessage, setErrorSubmittingMessage] = useState<boolean>(false);

  const isSubmitDisabled = content.length === 0 && !attachment;

  const submitMessage = useMutation(({ chatId, content }: any) => createChatMessage(chatId, content), {
    retry: false,
    onMutate: async (newMessage: any) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(['chats', 'messages', chat.id]);

      // Snapshot the previous value
      const prevChatMessages = queryClient.getQueryData(['chats', 'messages', chat.id]);
      const prevContent = content;

      // Clear state (content, attachment, etc)
      clearState();

      // Optimistically update to the new value
      queryClient.setQueryData(['chats', 'messages', chat.id], (prevResult: any) => {
        const newResult = { ...prevResult };
        newResult.pages = newResult.pages.map((page: any, idx: number) => {
          if (idx === 0) {
            return {
              ...page,
              result: [...page.result, {
                ...newMessage,
                id: String(Number(new Date())),
                created_at: new Date(),
                account_id: account?.id,
                pending: true,
              }],
            };
          }

          return page;
        });

        return newResult;
      });

      // Return a context object with the snapshotted value
      return { prevChatMessages, prevContent };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, _newData: any, context: any) => {
      setContent(context.prevContent);
      queryClient.setQueryData(['chats', 'messages', chat.id], context.prevChatMessages);
      setErrorSubmittingMessage(true);
    },
    // Always refetch after error or success:
    onSuccess: () => {
      queryClient.invalidateQueries(chatKeys.chatMessages(chat.id));
    },
  });

  const clearState = () => {
    setContent('');
    setAttachment(undefined);
    setIsUploading(false);
    setUploadProgress(0);
    setResetFileKey(fileKeyGen());
    setErrorSubmittingMessage(false);
  };

  const sendMessage = () => {
    if (!isSubmitDisabled && !submitMessage.isLoading) {
      const params = {
        content,
        media_id: attachment && attachment.id,
      };

      submitMessage.mutate({ chatId: chat.id, content });
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

  const handleRemoveFile = () => {
    setAttachment(undefined);
    setResetFileKey(fileKeyGen());
  };

  const onUploadProgress = (e: ProgressEvent) => {
    const { loaded, total } = e;
    setUploadProgress(loaded / total);
  };

  const handleFiles = (files: FileList) => {
    setIsUploading(true);

    const data = new FormData();
    data.append('file', files[0]);

    dispatch(uploadMedia(data, onUploadProgress)).then((response: any) => {
      setAttachment(response.data);
      setIsUploading(false);
    }).catch(() => {
      setIsUploading(false);
    });
  };

  const renderAttachment = () => {
    if (!attachment) return null;

    return (
      <div className='chat-box__attachment'>
        <div className='chat-box__filename'>
          {truncateFilename(attachment.preview_url, 20)}
        </div>
        <div className='chat-box__remove-attachment'>
          <IconButton
            src={require('@tabler/icons/x.svg')}
            onClick={handleRemoveFile}
          />
        </div>
      </div>
    );
  };

  const renderActionButton = () => {
    // return canSubmit() ? (
    //   <IconButton
    //     src={require('@tabler/icons/send.svg')}
    //     title={intl.formatMessage(messages.send)}
    //     onClick={sendMessage}
    //   />
    // ) : (
    //   <UploadButton onSelectFile={handleFiles} resetFileKey={resetFileKey} />
    // );
  };

  return (
    <Stack className={classNames('overflow-hidden flex flex-grow', className)} onMouseOver={handleMouseOver}>
      <div className='flex-grow h-full overflow-hidden flex justify-center'>
        <ChatMessageList chat={chat} autosize />
      </div>

      <div className='mt-auto pt-4 px-4 shadow-3xl'>
        <HStack alignItems='center' justifyContent='between' space={4}>
          <Stack grow>
            <Textarea
              autoFocus
              ref={inputRef}
              placeholder={intl.formatMessage(messages.placeholder)}
              onKeyDown={handleKeyDown}
              value={content}
              onChange={handleContentChange}
              isResizeable={false}
              autoGrow
              maxRows={5}
            />
          </Stack>

          <IconButton
            src={require('icons/airplane.svg')}
            iconClassName='w-5 h-5'
            className='text-primary-500'
            disabled={isSubmitDisabled}
            onClick={sendMessage}
          />
        </HStack>

        <HStack alignItems='center' className='h-5' space={1}>
          {hasErrorSubmittingMessage && (
            <>
              <Text theme='danger' size='xs'>
                {intl.formatMessage(messages.failedToSend)}
              </Text>

              <button onClick={sendMessage} className='flex hover:underline'>
                <Text theme='primary' size='xs' tag='span'>
                  {intl.formatMessage(messages.retry)}
                </Text>
              </button>
            </>
          )}
        </HStack>
      </div>
    </Stack>
    //   {renderAttachment()}
    //   {isUploading && (
    //     <UploadProgress progress={uploadProgress * 100} />
    //   )}
    //   <div className='chat-box__actions simple_form'>
    //     <div className='chat-box__send'>
    //       {renderActionButton()}
    //     </div>
    //     <textarea
    //       rows={1}
    //
    //
    //       onPaste={handlePaste}
    //       value={content}
    //       ref={setInputRef}
    //     />
    //   </div>
    // </div>
  );
};

export default Chat;
