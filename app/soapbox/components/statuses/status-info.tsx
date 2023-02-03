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
      className='flex items-center space-x-3 text-xs font-medium text-gray-700 hover:underline rtl:space-x-reverse dark:text-gray-600'
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