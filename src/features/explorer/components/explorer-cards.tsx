import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import rocketIcon from '@tabler/icons/outline/rocket.svg';
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';

const messages = defineMessages({
  welcomeTitle: { id: 'column.explorer.welcome_card.title', defaultMessage: 'Welcome to Explorer' },
  welcomeText: { id: 'column.explorer.welcome_card.text', defaultMessage: 'Explore the world of decentralized social media, dive into {nostrLink} or cross {bridgeLink} to other networks, and connect with a global community. All in one place.' },
  nostrTitle: { id: 'column.explorer.nostr', defaultMessage: 'Nostr' },
  bridgeTitle: { id: 'column.explorer.bridge', defaultMessage: 'Bridges' },
});

const ExplorerCards = () => {
  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();

  const handleClick = () => {
    setIsOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem('soapbox:explorer:card:status', JSON.stringify(!isOpen));
      return newValue;
    });
  };

  useEffect(
    () => {
      const value = localStorage.getItem('soapbox:explorer:card:status');
      if (value !== null) {
        setIsOpen(JSON.parse(value));
      }
    }, []);

  return (
    <Stack className='mx-4 mt-4' space={2}>
      <Stack
        space={4}
        className={`rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 ${isOpen ? 'mt-0 px-5 pb-8 pt-4' : 'p-4'}`}
      >
        <HStack justifyContent='between' className='text-white'>
          <HStack space={2}>
            <SvgIcon src={rocketIcon} />
            <p className='text-xl font-bold'>
              {intl.formatMessage(messages.welcomeTitle)}
            </p>
          </HStack>
          <IconButton
            src={arrowIcon}
            theme='transparent'
            onClick={handleClick}
            className={`transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </HStack>

        <Text className={`text-white ${isOpen ? 'max-h-96 opacity-100' : 'hidden max-h-0 opacity-0'}`}>
          {intl.formatMessage(messages.welcomeText, {
            nostrLink: <a className='font-medium text-secondary-400 underline' href='https://soapbox.pub/blog/nostr101/' target='_blank' rel='noopener noreferrer'>{intl.formatMessage(messages.nostrTitle)}</a>,
            bridgeLink: <a className='font-medium text-secondary-400 underline' href='https://soapbox.pub/blog/mostr-fediverse-nostr-bridge/' target='_blank' rel='noopener noreferrer'>{intl.formatMessage(messages.bridgeTitle)}</a>,
          })}
        </Text>
      </Stack>
    </Stack>
  );
};


export default ExplorerCards;