import classNames from 'clsx';
import React, { MutableRefObject, useEffect, useState } from 'react';

import { Stack } from 'soapbox/components/ui';
// import UploadProgress from 'soapbox/components/upload-progress';
// import UploadButton from 'soapbox/features/compose/components/upload_button';
import { IChat, useChatActions } from 'soapbox/queries/chats';
// import { truncateFilename } from 'soapbox/utils/media';

import ChatComposer from './chat-composer';
import ChatMessageList from './chat-message-list';

// const fileKeyGen = (): number => Math.floor((Math.random() * 0x10000));

interface ChatInterface {
  chat: IChat,
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>,
  className?: string,
}

/**
 * Chat UI with just the messages and textarea.
 * Reused between floating desktop chats and fullscreen/mobile chats.
 */
const Chat: React.FC<ChatInterface> = ({ chat, inputRef, className }) => {
  const { createChatMessage, acceptChat } = useChatActions(chat.id);

  const [content, setContent] = useState<string>('');
  const [attachment, setAttachment] = useState<any>(undefined);
  // const [isUploading, setIsUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [resetFileKey, setResetFileKey] = useState<number>(fileKeyGen());
  const [hasErrorSubmittingMessage, setErrorSubmittingMessage] = useState<boolean>(false);

  const isSubmitDisabled = content.length === 0 && !attachment;

  const submitMessage = () => {
    createChatMessage.mutate({ chatId: chat.id, content }, {
      onError: (_error, _variables, context: any) => {
        setContent(context.prevContent as string);
        setErrorSubmittingMessage(true);
      },
      onSuccess: () => {
        setErrorSubmittingMessage(false);
      },
    });

    clearState();
  };

  const clearState = () => {
    setContent('');
    setAttachment(undefined);
    // setIsUploading(false);
    // setUploadProgress(0);
    // setResetFileKey(fileKeyGen());
    // setErrorSubmittingMessage(false);
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

  // const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
  //   if (isSubmitDisabled && e.clipboardData && e.clipboardData.files.length === 1) {
  //     handleFiles(e.clipboardData.files);
  //   }
  // };

  const markRead = () => {
    // markAsRead.mutate();
    // dispatch(markChatRead(chatId));
  };

  const handleMouseOver = () => markRead();

  // const handleRemoveFile = () => {
  //   setAttachment(undefined);
  //   setResetFileKey(fileKeyGen());
  // };

  // const onUploadProgress = (e: ProgressEvent) => {
  //   const { loaded, total } = e;
  //   setUploadProgress(loaded / total);
  // };

  // const handleFiles = (files: FileList) => {
  //   setIsUploading(true);

  //   const data = new FormData();
  //   data.append('file', files[0]);

  //   dispatch(uploadMedia(data, onUploadProgress)).then((response: any) => {
  //     setAttachment(response.data);
  //     setIsUploading(false);
  //   }).catch(() => {
  //     setIsUploading(false);
  //   });
  // };

  // const renderAttachment = () => {
  //   if (!attachment) return null;

  //   return (
  //     <div className='chat-box__attachment'>
  //       <div className='chat-box__filename'>
  //         {truncateFilename(attachment.preview_url, 20)}
  //       </div>
  //       <div className='chat-box__remove-attachment'>
  //         <IconButton
  //           src={require('@tabler/icons/x.svg')}
  //           onClick={handleRemoveFile}
  //         />
  //       </div>
  //     </div>
  //   );
  // };

  // const renderActionButton = () => {
  //   return canSubmit() ? (
  //     <IconButton
  //       src={require('@tabler/icons/send.svg')}
  //       title={intl.formatMessage(messages.send)}
  //       onClick={sendMessage}
  //     />
  //   ) : (
  //     <UploadButton onSelectFile={handleFiles} resetFileKey={resetFileKey} />
  //   );
  // };

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [chat.id, inputRef?.current]);

  return (
    <Stack className={classNames('overflow-hidden flex flex-grow', className)} onMouseOver={handleMouseOver}>
      <div className='flex-grow h-full overflow-hidden flex justify-center'>
        <ChatMessageList chat={chat} />
      </div>

      <ChatComposer
        ref={inputRef}
        onKeyDown={handleKeyDown}
        value={content}
        onChange={handleContentChange}
        onSubmit={sendMessage}
        hasErrorSubmittingMessage={hasErrorSubmittingMessage}
      />
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
