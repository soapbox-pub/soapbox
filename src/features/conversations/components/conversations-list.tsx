import { debounce } from 'es-toolkit';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandConversations } from 'soapbox/actions/conversations.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import Conversation from './conversation.tsx';

import type { VirtuosoHandle } from 'react-virtuoso';

const ConversationsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const ref = useRef<VirtuosoHandle>(null);

  const conversations = useAppSelector((state) => state.conversations.items);
  const isLoading = useAppSelector((state) => state.conversations.isLoading);
  const hasMore = useAppSelector((state) => state.conversations.hasMore);

  const getCurrentIndex = (id: string) => conversations.findIndex(x => x.id === id);

  const handleMoveUp = (id: string) => {
    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex);
  };

  const selectChild = (index: number) => {
    ref.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        const element = document.querySelector<HTMLDivElement>(`#direct-list [data-index="${index}"] .focusable`);

        if (element) {
          element.focus();
        }
      },
    });
  };

  const handleLoadOlder = debounce(() => {
    const maxId = conversations.getIn([-1, 'id']);
    if (maxId) dispatch(expandConversations({ maxId }));
  }, 300, { edges: ['leading'] });

  return (
    <ScrollableList
      hasMore={hasMore}
      onLoadMore={handleLoadOlder}
      id='direct-list'
      scrollKey='direct'
      ref={ref}
      isLoading={isLoading}
      showLoading={isLoading && conversations.size === 0}
      emptyMessage={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any direct messages yet. When you send or receive one, it will show up here." />}
    >
      {conversations.map((item: any) => (
        <Conversation
          key={item.id}
          conversationId={item.id}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ))}
    </ScrollableList>
  );
};

export default ConversationsList;
