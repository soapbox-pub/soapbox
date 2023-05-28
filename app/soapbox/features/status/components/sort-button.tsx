import React from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';

import DropdownMenu from 'soapbox/components/dropdown-menu/dropdown-menu';
import { Button, Text } from 'soapbox/components/ui';

type Sort = 'trending' | 'newest' | 'oldest' | 'controversial'

interface ISortButton {
  sort: Sort
  onChange: (sort: Sort) => void
}

const SortButton: React.FC<ISortButton> = ({ sort, onChange }) => {
  const intl = useIntl();

  const icons: Record<Sort, string> = {
    trending: require('@tabler/icons/flame.svg'),
    newest: require('@tabler/icons/sort-descending.svg'),
    oldest: require('@tabler/icons/sort-ascending.svg'),
    controversial: require('@tabler/icons/bolt.svg'),
  };

  const labels: Record<Sort, MessageDescriptor> = {
    trending: { id: 'sort.trending', defaultMessage: 'Trending' },
    newest: { id: 'sort.newest', defaultMessage: 'Newest' },
    oldest: { id: 'sort.oldest', defaultMessage: 'Oldest' },
    controversial: { id: 'sort.controversial', defaultMessage: 'Controversial' },
  };

  const menu: React.ComponentProps<typeof DropdownMenu>['items'] = [
    { text: intl.formatMessage(labels.trending), icon: icons.trending, action: () => onChange('trending') },
    { text: intl.formatMessage(labels.newest), icon: icons.newest, action: () => onChange('newest') },
    { text: intl.formatMessage(labels.oldest), icon: icons.oldest, action: () => onChange('oldest') },
    { text: intl.formatMessage(labels.controversial), icon: icons.controversial, action: () => onChange('controversial') },
  ];

  return (
    <DropdownMenu items={menu}>
      <Button className='text-gray-900 dark:text-gray-100' theme='outline' icon={icons[sort]}>
        <Text>{intl.formatMessage(labels[sort])}</Text>
      </Button>
    </DropdownMenu>
  );
};

export { SortButton, type Sort };