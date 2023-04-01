import React, { HTMLAttributes } from 'react';

import { HStack, IconButton, Text } from 'soapbox/components/ui';

interface IChatPaneHeader {
  isOpen: boolean
  isToggleable?: boolean
  onToggle(): void
  title: string | React.ReactNode
  unreadCount?: number
  secondaryAction?(): void
  secondaryActionIcon?: string
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
            <Text weight='semibold' data-testid='unread-count'>
              ({unreadCount})
            </Text>

            <div className='h-2.5 w-2.5 rounded-full bg-accent-300' />
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
          src={isOpen ? require('@tabler/icons/chevron-down.svg') : require('@tabler/icons/chevron-up.svg')}
          iconClassName='h-5 w-5 text-gray-600'
        />
      </HStack>
    </HStack>
  );
};

export default ChatPaneHeader;
