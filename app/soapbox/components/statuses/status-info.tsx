import React from 'react';
import { Link } from 'react-router-dom';

interface IStatusInfo {
  avatarSize: number
  to?: string
  icon: React.ReactNode
  text: React.ReactNode
}

const StatusInfo = (props: IStatusInfo) => {
  const { avatarSize, to, icon, text } = props;

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.stopPropagation();
  };

  const Container = to ? Link : 'div';
  const containerProps: any = to ? { onClick, to } : {};

  return (
    <Container
      {...containerProps}
      className='flex items-center text-gray-700 dark:text-gray-600 text-xs font-medium space-x-3 rtl:space-x-reverse hover:underline'
    >
      <div
        className='flex justify-end'
        style={{ width: avatarSize }}
      >
        {icon}
      </div>

      {text}
    </Container>
  );
};

export default StatusInfo;