import clsx from 'clsx';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SelectDropdown } from '../features/forms';

import Icon from './icon';
import { HStack, Select } from './ui';

interface IList {
  children: React.ReactNode
}

const List: React.FC<IList> = ({ children }) => (
  <div className='space-y-0.5'>{children}</div>
);

interface IListItem {
  label: React.ReactNode
  hint?: React.ReactNode
  onClick?(): void
  onSelect?(): void
  isSelected?: boolean
  children?: React.ReactNode
}

const ListItem: React.FC<IListItem> = ({ label, hint, children, onClick, onSelect, isSelected }) => {
  const id = uuidv4();
  const domId = `list-group-${id}`;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick!();
    }
  };

  const Comp = onClick ? 'a' : 'div';
  const LabelComp = onClick || onSelect ? 'span' : 'label';
  const linkProps = onClick || onSelect ? { onClick: onClick || onSelect, onKeyDown, tabIndex: 0, role: 'link' } : {};

  const renderChildren = React.useCallback(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const isSelect = child.type === SelectDropdown || child.type === Select;

        return React.cloneElement(child, {
          id: domId,
          className: clsx({
            'w-auto': isSelect,
          }, child.props.className),
        });
      }

      return null;
    });
  }, [children, domId]);

  return (
    <Comp
      className={clsx({
        'flex items-center justify-between px-3 py-2 first:rounded-t-lg last:rounded-b-lg bg-gradient-to-r from-gradient-start/10 to-gradient-end/10': true,
        'cursor-pointer hover:from-gradient-start/20 hover:to-gradient-end/20 dark:hover:from-gradient-start/5 dark:hover:to-gradient-end/5': typeof onClick !== 'undefined' || typeof onSelect !== 'undefined',
      })}
      {...linkProps}
    >
      <div className='flex flex-col py-1.5 pr-4 rtl:pl-4 rtl:pr-0'>
        <LabelComp className='text-gray-900 dark:text-gray-100' htmlFor={domId}>{label}</LabelComp>

        {hint ? (
          <span className='text-sm text-gray-700 dark:text-gray-600'>{hint}</span>
        ) : null}
      </div>

      {onClick ? (
        <HStack space={1} alignItems='center' className='text-gray-700 dark:text-gray-600'>
          {children}

          <Icon src={require('@tabler/icons/chevron-right.svg')} className='ml-1 rtl:rotate-180' />
        </HStack>
      ) : null}

      {onSelect ? (
        <div className='flex flex-row items-center text-gray-700 dark:text-gray-600'>
          {children}

          {isSelected ? (
            <Icon src={require('@tabler/icons/check.svg')} className='ml-1 text-primary-500 dark:text-primary-400' />
          ) : null}
        </div>
      ) : null}

      {typeof onClick === 'undefined' && typeof onSelect === 'undefined' ? renderChildren() : null}
    </Comp>
  );
};

export { List as default, ListItem };
