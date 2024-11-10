import { useHistory } from 'react-router-dom';

import { ChatProvider } from 'soapbox/contexts/chat-context.tsx';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';

import ChatPane from '../chat-pane/chat-pane.tsx';

const ChatWidget = () => {
  const { account } = useOwnAccount();
  const history = useHistory();

  const path = history.location.pathname;
  const isChatsPath = Boolean(path.match(/^\/chats/));
  const isOnboarded = account?.source?.chats_onboarded ?? true;

  if (!isOnboarded || isChatsPath) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export default ChatWidget;
