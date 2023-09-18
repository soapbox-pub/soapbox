import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { directComposeById } from 'soapbox/actions/compose';
import { mountConversations, unmountConversations, expandConversations } from 'soapbox/actions/conversations';
import { useDirectStream } from 'soapbox/api/hooks';
import AccountSearch from 'soapbox/components/account-search';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import ConversationsList from './components/conversations-list';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search_placeholder', defaultMessage: 'Send a message to…' },
});

const ConversationsTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useDirectStream();

  useEffect(() => {
    dispatch(mountConversations());
    dispatch(expandConversations());

    return () => {
      dispatch(unmountConversations());
    };
  }, []);

  const handleSuggestion = (accountId: string) => {
    dispatch(directComposeById(accountId));
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <AccountSearch
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        onSelected={handleSuggestion}
      />

      <ConversationsList />
    </Column>
  );
};

export default ConversationsTimeline;
