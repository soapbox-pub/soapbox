import chevronDownIcon from '@tabler/icons/outline/chevron-down.svg';
import chevronUpIcon from '@tabler/icons/outline/chevron-up.svg';
import React, { HTMLAttributes } from 'react';

import { HStack, IconButton, Text } from 'soapbox/components/ui';

interface IChatPaneHeader {
  isOpen: boolean;
  isToggleable?: boolean;
  onToggle(): void;
  title: string | React.ReactNode;
  unreadCount?: number;
  secondaryAction?(): void;
  secondaryActionIcon?: string;
}

const ChatPaneHeader = (props: IChatPaneHeader) => {
  const {
    isOpen,
    isToggleable = true,
    onToggle,
    secondaryAction,
    secondaryActionIcon,
    title,
    unreadCount,
    ...rest
  } = props;

  const ButtonComp = isToggleable ? 'button' : 'div';
  const buttonProps: HTMLAttributes<HTMLButtonElement | HTMLDivElement> = {};
  if (isToggleable) {
    buttonProps.onClick = onToggle;
  }

  return (
    <HStack {...rest} alignItems='center' justifyContent='between' className='h-16 rounded-t-xl px-4 py-3'>
      <ButtonComp
        className='flex h-16 grow flex-row items-center space-x-1'
        data-testid='title'
        {...buttonProps}
      >
        <Text weight='semibold' tag='div'>
          {title}
        </Text>

        {(typeof unreadCount !== 'undefined' && unreadCount > 0) && (
          <HStack alignItems='center' space={2}>
            {/* eslint-disable formatjs/no-literal-string-in-jsx */}
            <Text weight='semibold' data-testid='unread-count'>
              ({unreadCount})
            </Text>
            {/* eslint-enable formatjs/no-literal-string-in-jsx */}

            <div className='size-2.5 rounded-full bg-accent-300' />
          </HStack>
        )}
      </ButtonComp>

      <HStack space={2} alignItems='center'>
        {secondaryAction ? (
          <IconButton
            onClick={secondaryAction}
            src={secondaryActionIcon as string}
            iconClassName='h-5 w-5 text-gray-600'
          />
        ) : null}

        <IconButton
          onClick={onToggle}
          src={isOpen ? chevronDownIcon : chevronUpIcon}
          iconClassName='h-5 w-5 text-gray-600'
        />
      </HStack>
    </HStack>
  );
};

export default ChatPaneHeader;
