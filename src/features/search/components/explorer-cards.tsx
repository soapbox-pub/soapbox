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
  nostrText: { id: 'column.explorer.nostr_card.text', defaultMessage: 'Wondering about Nostr? <a>Click here</a>' },
  bridgeTitle: { id: 'column.explorer.bridge_card.title', defaultMessage: 'Bridge' },
  bridgeText: { id: 'column.explorer.bridge_card.text', defaultMessage: 'Curious about Bridges? <a>Click here</a>' },
});

const ExplorerCards = () => {
  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();
  return (
    <Stack>
      <Stack
        space={4}
        className={`m-2 rounded-xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 sm:m-4 ${isOpen ? 'mt-0 px-5 pb-8 pt-4' : 'p-4'}`}
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
            className={`transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </HStack>

        <Text className={`text-white ${isOpen ? 'max-h-96 opacity-100' : 'hidden max-h-0 opacity-0'}`}>
          {intl.formatMessage(messages.welcomeText, {
            span: (node) => <span className='text-black'>{node}</span>,
          })}
        </Text>
      </Stack>

      <HStack className={`mx-2 mb-2 sm:mx-4 sm:mb-4 ${isOpen ? 'max-h-96 opacity-100' : 'hidden max-h-0 opacity-0'}`} space={2}>
        {/* Nostr */}
        <Stack
          space={4}
          className='w-1/2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 px-5 pb-6 pt-4'
          justifyContent='center'
        >
          <HStack alignItems='center' justifyContent='between'>
            {/* Title */}
            <Stack space={2}>
              <p className='text-xl font-bold text-white'>
                {intl.formatMessage(messages.nostrTitle)}
              </p>
              <Text className='text-white'>
                {intl.formatMessage(messages.nostrText, {
                  a: (node) => <a className='text-black underline' target='_blank' href='https://soapbox.pub/blog/nostr101/'>{node}</a>,
                })}
              </Text>
            </Stack>

            <div className='flex min-h-20 min-w-20 items-center justify-center rounded-full bg-white p-1 sm:size-16'>
              <img className='size-16' src={nostrImg} alt='' />
            </div>
          </HStack>
        </Stack>

        {/* Bridge */}
        <Stack
          space={4}
          className='w-1/2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-400 px-5 pb-6 pt-4'
        >
          <HStack  alignItems='center' className='sm:min-w-48'>
            {/* Title */}
            <Stack space={2}>
              <p className='text-xl font-bold text-white'> {intl.formatMessage(messages.bridgeTitle)} </p>
              <Text className='text-white'>
                {intl.formatMessage(messages.bridgeText, {
                  a: (node) => <a className='text-black underline' target='_blank' href='https://soapbox.pub/blog/mostr-fediverse-nostr-bridge/'>{node}</a>,
                })}
              </Text>
            </Stack>

            <div className='flex min-h-20 min-w-20 items-center justify-center rounded-full bg-white p-1 sm:size-16'>
              <img className='size-16' src={bridgeImg} alt='' />
            </div>
          </HStack>
        </Stack>
      </HStack>
    </Stack>
  );
};


export default ExplorerCards;