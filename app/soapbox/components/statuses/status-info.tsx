import React from 'react';

import { HStack, Text } from '../ui';

interface IStatusInfo {
  avatarSize: number
  icon: React.ReactNode
  text: React.ReactNode
}

const StatusInfo = (props: IStatusInfo) => {
  const { avatarSize, icon, text } = props;

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      // eslint-disable-next-line jsx-a11y/aria-role
      role='status-info'
      onClick={onClick}
    >
      <HStack
        space={3}
        alignItems='center'
        className='cursor-default text-xs font-medium text-gray-700 rtl:space-x-reverse dark:text-gray-600'
      >
        <div
          className='flex justify-end'
          style={{ width: avatarSize }}
        >
          {icon}
        </div>

        <Text size='xs' theme='muted' weight='medium'>
          {text}
        </Text>
      </HStack>
    </div>
  );
};

export default StatusInfo;