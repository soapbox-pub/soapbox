import arrowLeftIcon from '@tabler/icons/outline/arrow-left.svg';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CardTitle } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';

import ChatSearch from '../../chat-search/chat-search.tsx';

const messages = defineMessages({
  title: { id: 'chat.new_message.title', defaultMessage: 'New Message' },
});

interface IChatPageNew {
}

/** New message form to create a chat. */
const ChatPageNew: React.FC<IChatPageNew> = () => {
  const intl = useIntl();
  const history = useHistory();

  return (
    <Stack className='h-full space-y-4'>
      <Stack className='grow px-4 pt-6 sm:px-6'>
        <HStack alignItems='center'>
          <IconButton
            src={arrowLeftIcon}
            className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
            onClick={() => history.push('/chats')}
          />

          <CardTitle title={intl.formatMessage(messages.title)} />
        </HStack>
      </Stack>

      <ChatSearch isMainPage />
    </Stack>
  );
};

export default ChatPageNew;
