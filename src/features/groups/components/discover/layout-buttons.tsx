import clsx from 'clsx';
import React from 'react';

import { HStack, Icon } from 'soapbox/components/ui';

enum GroupLayout {
  LIST = 'LIST',
  GRID = 'GRID'
}

interface ILayoutButtons {
  layout: GroupLayout;
  onSelect(layout: GroupLayout): void;
}

const LayoutButtons = ({ layout, onSelect }: ILayoutButtons) => (
  <HStack alignItems='center' space={1}>
    <button
      data-testid='layout-list-action'
      onClick={() => onSelect(GroupLayout.LIST)}
    >
      <Icon
        src={require('@tabler/icons/outline/layout-list.svg')}
        className={
          clsx('size-5 text-gray-600', {
            'text-primary-600': layout === GroupLayout.LIST,
          })
        }
      />
    </button>

    <button
      data-testid='layout-grid-action'
      onClick={() => onSelect(GroupLayout.GRID)}
    >
      <Icon
        src={require('@tabler/icons/outline/layout-grid.svg')}
        className={
          clsx('size-5 text-gray-600', {
            'text-primary-600': layout === GroupLayout.GRID,
          })
        }
      />
    </button>
  </HStack>
);

export { LayoutButtons as default, GroupLayout };