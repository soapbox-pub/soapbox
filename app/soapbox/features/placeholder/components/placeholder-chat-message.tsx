import clsx from 'clsx';
import React from 'react';

import { HStack, Stack, Text } from 'soapbox/components/ui';

import { randomIntFromInterval } from '../utils';

import PlaceholderAvatar from './placeholder-avatar';

/** Fake chat to display while data is loading. */
const PlaceholderChatMessage = ({ isMyMessage = false }: { isMyMessage?: boolean }) => {
  const messageLength = randomIntFromInterval(160, 220);

  return (
    <Stack
      data-testid='placeholder-chat-message'
      space={1}
      className={clsx({
        'max-w-[85%] animate-pulse': true,
        'ml-auto': isMyMessage,
      })}
    >
      <HStack
        alignItems='center'
        justifyContent={isMyMessage ? 'end' : 'start'}
      >
        <div
          className={
            clsx({
              'text-ellipsis break-words relative rounded-md p-2': true,
              'mr-2': isMyMessage,
              'order-2 ml-2': !isMyMessage,
            })
          }
        >
          <div style={{ width: messageLength, height: 20 }} className='rounded-full bg-primary-50 dark:bg-primary-800' />
        </div>

        <div className={clsx({ 'order-1': !isMyMessage })}>
          <PlaceholderAvatar size={34} />
        </div>
      </HStack>

      <HStack
        alignItems='center'
        space={2}
        className={clsx({
          'ml-auto': isMyMessage,
        })}
      >
        <Text
          theme='muted'
          size='xs'
          className={clsx({
            'text-right': isMyMessage,
            'order-2': !isMyMessage,
          })}
        >
          <span style={{ width: 50, height: 12 }} className='block rounded-full bg-primary-50 dark:bg-primary-800' />
        </Text>

        <div className={clsx({ 'order-1': !isMyMessage })}>
          <div className='ml-2 w-[34px]' />
        </div>
      </HStack>
    </Stack>
  );
};

export default PlaceholderChatMessage;
