import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { Counter, Icon } from '../ui';

export interface MenuItem {
  action?: React.EventHandler<React.KeyboardEvent | React.MouseEvent>
  active?: boolean
  count?: number
  destructive?: boolean
  href?: string
  icon?: string
  meta?: string
  middleClick?(event: React.MouseEvent): void
  target?: React.HTMLAttributeAnchorTarget
  text: string
  to?: string
}

interface IDropdownMenuItem {
  index: number
  item: MenuItem | null
  onClick?(): void
}

const DropdownMenuItem = ({ index, item, onClick }: IDropdownMenuItem) => {
  const history = useHistory();

  const itemRef = useRef<HTMLAnchorElement>(null);

  const handleClick: React.EventHandler<React.MouseEvent | React.KeyboardEvent> = (event) => {
    event.stopPropagation();

    if (!item) return;
    if (onClick) onClick();


    if (item.to) {
      event.preventDefault();
      history.push(item.to);
    } else if (typeof item.action === 'function') {
      event.preventDefault();
      item.action(event);
    }
  };

  const handleAuxClick: React.EventHandler<React.MouseEvent> = (event) => {
    if (!item) return;
    if (onClick) onClick();

    if (event.button === 1 && item.middleClick) {
      item.middleClick(event);
    }
  };

  const handleItemKeyPress: React.EventHandler<React.KeyboardEvent> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick(event);
    }
  };

  useEffect(() => {
    const firstItem = index === 0;

    if (itemRef.current && firstItem) {
      itemRef.current.focus({ preventScroll: true });
    }
  }, [itemRef.current, index]);

  if (item === null) {
    return <li className='mx-2 my-1 h-[2px] bg-gray-100 dark:bg-gray-800' />;
  }

  return (
    <li className='truncate focus-visible:ring-2 focus-visible:ring-primary-500'>
      <a
        href={item.href || item.to || '#'}
        role='button'
        tabIndex={0}
        ref={itemRef}
        data-index={index}
        onClick={handleClick}
        onAuxClick={handleAuxClick}
        onKeyPress={handleItemKeyPress}
        target={item.target}
        title={item.text}
        className={
          clsx({
            'flex px-4 py-2.5 text-sm text-gray-700 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none cursor-pointer': true,
            'text-danger-600 dark:text-danger-400': item.destructive,
          })
        }
      >
        {item.icon && <Icon src={item.icon} className='mr-3 h-5 w-5 flex-none rtl:ml-3 rtl:mr-0' />}

        <span className='truncate font-medium'>{item.text}</span>

        {item.count ? (
          <span className='ml-auto h-5 w-5 flex-none'>
            <Counter count={item.count} />
          </span>
        ) : null}
      </a>
    </li>
  );
};

export default DropdownMenuItem;
