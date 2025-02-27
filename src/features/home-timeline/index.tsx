import { useState, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';

import Tabs from 'soapbox/components/ui/tabs.tsx';
import { CommunityTimeline, FollowsTimeline } from 'soapbox/features/ui/util/async-components.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

const HomeTimeline = () => {
  const { instance } = useInstance();
  const [activeTab, setActiveTab] = useState('follows');
  const notifications = useAppSelector((state) => state.notificationsTab);

  return (
    <>
      <Tabs
        items={[
          {
            name: 'follows',
            text: <FormattedMessage id='tabs_bar.follows' defaultMessage='Follows' />,
            action: () => setActiveTab('follows'),
            notification: notifications.home,
          },
          {
            name: 'local',
            text: <div className='block max-w-xs truncate'>{instance.title}</div>,
            action: () => setActiveTab('local'),
            notification: notifications.instance,
          },
        ]}
        activeItem={activeTab}
      />

      <Suspense fallback={<div className='p-4 text-center'><FormattedMessage id='loading_indicator.label' defaultMessage='Loading...' /></div>}>
        {activeTab === 'follows' ? <FollowsTimeline /> : <CommunityTimeline />}
      </Suspense>
    </>
  );
};

export default HomeTimeline;