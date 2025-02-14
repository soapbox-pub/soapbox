import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import rocketIcon from '@tabler/icons/outline/rocket.svg';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import bridgeImg from 'soapbox/assets/images/bridge-image.png';
import nostrImg from 'soapbox/assets/images/nostr-image.png';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';

const messages = defineMessages({
  welcomeTitle: { id: 'column.explorer.welcome_card.title', defaultMessage: 'Welcome to Explorer' },
  welcomeText: { id: 'column.explorer.welcome_card.text', defaultMessage: 'Explore the world of <span>decentralized social media</span>, dive into <span>Nostr</span> or cross the bridge to other networks, and connect with a global community. All in one place.' },
  nostrTitle: { id: 'column.explorer.nostr_card.title', defaultMessage: 'Nostr' },
  nostrText: { id: 'column.explorer.nostr_card.text', defaultMessage: 'Wondering about Nostr? Find Out More' },
  bridgeTitle: { id: 'column.explorer.bridge_card.title', defaultMessage: 'Bridge' },
  bridgeText: { id: 'column.explorer.bridge_card.text', defaultMessage: 'Curious about Bridges? Click here' },
});

const ExplorerCards = () => {
  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();
  return (
    <Stack>
      <Stack
        space={4}
        className={`rounded-xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 ${isOpen ? 'mx-4 mb-4 px-5 pb-8 pt-4' : 'm-4 p-4'}`}
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
            onClick={() => setIsOpen(!isOpen)}
            className={`transition-transform duration-300${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
          />
        </HStack>

        <Text className={`text-white ${isOpen ? 'max-h-96 opacity-100' : 'hidden max-h-0 opacity-0'}`}>
          {intl.formatMessage(messages.welcomeText, {
            span: (node) => <span className='text-black'>{node}</span>,
          })}
        </Text>
      </Stack>

      <HStack className={`mx-4 mb-4 ${isOpen ? 'max-h-96 opacity-100' : 'hidden max-h-0 opacity-0'}`} space={4}>
        {/* Nostr */}
        <Stack
          space={4}
          className='w-1/2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 px-5 pb-8 pt-4'
          justifyContent='center'
        >
          <HStack space={2} alignItems='center' justifyContent='center'>
            {/* Title */}
            <Stack space={2}>
              <p className='text-xl font-bold text-white'>
                {intl.formatMessage(messages.nostrTitle)}
              </p>
              <Text className='text-white'>
                {intl.formatMessage(messages.nostrText)}
              </Text>
            </Stack>

            <div className='w-1/2 rounded-full bg-white p-2'>
              <img src={nostrImg} alt='' />
            </div>
          </HStack>
        </Stack>

        {/* Bridge */}
        <Stack
          space={4}
          className='w-1/2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-400 px-5 pb-8 pt-4'
        >
          <HStack space={2} alignItems='center'>
            {/* Title */}
            <Stack space={2}>
              <p className='text-xl font-bold text-white'> {intl.formatMessage(messages.bridgeTitle)} </p>
              <Text className='text-white'>
                {intl.formatMessage(messages.bridgeText)}
              </Text>
            </Stack>

            <div className='w-1/2 rounded-full bg-white p-2'>
              <img src={bridgeImg} alt='' />
            </div>
          </HStack>
        </Stack>
      </HStack>
    </Stack>
  );
};


export default ExplorerCards;