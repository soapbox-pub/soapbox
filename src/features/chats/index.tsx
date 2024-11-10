import { ChatProvider } from 'soapbox/contexts/chat-context.tsx';

import ChatPage from './components/chat-page/chat-page.tsx';

interface IChatIndex {
  params?: {
    chatId?: string;
  };
}

const ChatIndex: React.FC<IChatIndex> = ({ params }) => (
  <ChatProvider>
    <ChatPage chatId={params?.chatId} />
  </ChatProvider>
);

export default ChatIndex;
