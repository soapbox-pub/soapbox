import React from 'react';

import { Stack } from 'soapbox/components/ui';

import PopularGroups from './components/discover/popular-groups';
import SuggestedGroups from './components/discover/suggested-groups';
import TabBar, { TabItems } from './components/tab-bar';

const Discover: React.FC = () => {
  return (
    <Stack space={4}>
      <TabBar activeTab={TabItems.FIND_GROUPS} />

      <Stack space={6}>
        <PopularGroups />
        <SuggestedGroups />
      </Stack>
    </Stack>
  );
};

export default Discover;
