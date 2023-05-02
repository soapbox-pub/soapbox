import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Tabs } from 'soapbox/components/ui';

import type { Item } from 'soapbox/components/ui/tabs/tabs';

export enum TabItems {
  MY_GROUPS = 'MY_GROUPS',
  FIND_GROUPS = 'FIND_GROUPS'
}

interface ITabBar {
  activeTab: TabItems
}

const TabBar = ({ activeTab }: ITabBar) => {
  const history = useHistory();

  const tabItems: Item[] = useMemo(() => ([
    {
      text: 'My Groups',
      action: () => history.push('/groups'),
      name: TabItems.MY_GROUPS,
    },
    {
      text: 'Find Groups',
      action: () => history.push('/groups/discover'),
      name: TabItems.FIND_GROUPS,
    },
  ]), []);

  return (
    <Tabs
      items={tabItems}
      activeItem={activeTab}
    />
  );
};

export default TabBar;