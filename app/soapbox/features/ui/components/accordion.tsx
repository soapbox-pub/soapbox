import classNames from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { HStack, Icon, Text } from 'soapbox/components/ui';
import DropdownMenu from 'soapbox/containers/dropdown-menu-container';

import type { Menu } from 'soapbox/components/dropdown-menu';

const messages = defineMessages({
  collapse: { id: 'accordion.collapse', defaultMessage: 'Collapse' },
  expand: { id: 'accordion.expand', defaultMessage: 'Expand' },
});

interface IAccordion {
  headline: React.ReactNode,
  children?: React.ReactNode,
  menu?: Menu,
  expanded?: boolean,
  onToggle?: (value: boolean) => void,
}

const Accordion: React.FC<IAccordion> = ({ headline, children, menu, expanded = false, onToggle = () => {} }) => {
  const intl = useIntl();

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggle(!expanded);
    e.preventDefault();
  };

  return (
    <div className='bg-white dark:bg-primary-800 text-gray-900 dark:text-gray-100 rounded-lg shadow dark:shadow-none'>
      <button
        type='button'
        onClick={handleToggle}
        title={intl.formatMessage(expanded ? messages.collapse : messages.expand)}
        aria-expanded={expanded}
        className='px-4 py-3 font-semibold flex items-center justify-between w-full'
      >
        <span>{headline}</span>

        <HStack alignItems='center' space={2}>
          {menu && (
            <DropdownMenu
              items={menu}
              src={require('@tabler/icons/dots-vertical.svg')}
            />
          )}
          <Icon
            src={expanded ? require('@tabler/icons/chevron-up.svg') : require('@tabler/icons/chevron-down.svg')}
            className='text-gray-700 dark:text-gray-600 h-5 w-5'
          />
        </HStack>
      </button>

      <div
        className={
          classNames({
            'p-4 rounded-b-lg border-t border-solid border-gray-100 dark:border-primary-900': true,
            'h-0 hidden': !expanded,
          })
        }
      >
        <Text>{children}</Text>
      </div>
    </div>
  );
};

export default Accordion;
