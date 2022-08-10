import React, { HTMLAttributes } from 'react';

import { HStack, IconButton, Text } from 'soapbox/components/ui';

interface IChatPaneHeader {
  isOpen: boolean
  isToggleable?: boolean
  onToggle(): void
  title: string | React.ReactNode
  unreadCount?: number
}

const ChatPaneHeader = (props: IChatPaneHeader) => {
  const { onToggle, isOpen, isToggleable = true, title, unreadCount } = props;

  const ButtonComp = isToggleable ? 'button' : 'div';
  const buttonProps: HTMLAttributes<HTMLButtonElement | HTMLDivElement> = {};
  if (isToggleable) {
    buttonProps.onClick = onToggle;
  }

  return (
    <HStack alignItems='center' justifyContent='between' className='rounded-t-xl h-16 py-3 px-4'>
      <ButtonComp
        className='flex-grow flex items-center flex-row space-x-1 h-16'
        {...buttonProps}
      >
        {typeof title === 'string' ? (
          <Text weight='semibold'>
            {title}
          </Text>
        ) : (title)}

        {(typeof unreadCount !== 'undefined' && unreadCount > 0) && (
          <HStack alignItems='center' space={2}>
            <Text weight='semibold'>
              ({unreadCount})
            </Text>

            <div className='bg-accent-300 w-2.5 h-2.5 rounded-full' />
          </HStack>
        )}
      </ButtonComp>

      <IconButton
        onClick={onToggle}
        src={isOpen ? require('@tabler/icons/chevron-down.svg') : require('@tabler/icons/chevron-up.svg')}
        iconClassName='w-5 h-5 text-gray-600'
      />
    </HStack>
  );
};

export default ChatPaneHeader;
