import React from 'react';

import { IconButton } from 'soapbox/components/ui';

interface IChatPaneHeader {
  onClose?: () => void,
  children: React.ReactNode,
}

const ChatPaneHeader: React.FC<IChatPaneHeader> = ({ onClose, children }) => {
  return (
    <div className='pane__header'>
      {children}

      <div className='pane__close'>
        <IconButton src={require('@tabler/icons/icons/x.svg')} title='Close chat' onClick={onClose} />
      </div>
    </div>
  );
};

interface IChatPane {
  header: React.ReactNode,
  children: React.ReactNode,
}

/** UI for a floating desktop chat. */
const ChatPane: React.FC<IChatPane> = ({ header, children }) => {
  return (
    <div className='flex flex-col shadow-md rounded-t-md fixed bottom-0 right-5 w-[256px] h-[350px] z-[1000]'>
      <ChatPaneHeader>
        {header}
      </ChatPaneHeader>

      <div className='pane__content'>
        {children}
      </div>
    </div>
  );
};

export default ChatPane;
