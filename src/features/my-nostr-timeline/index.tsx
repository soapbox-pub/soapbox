import { useState, lazy, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';

import Tabs from 'soapbox/components/ui/tabs.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

const HomeTimeline = lazy(() => import('soapbox/features/my-nostr-timeline/home-timeline.tsx'));
const CommunityTimeline = lazy(() => import('soapbox/features/my-nostr-timeline/community-timeline.tsx'));

const MyNostrTimeline = () => {
  const { instance } = useInstance();
  const [activeTab, setActiveTab] = useState('forYou');
  const notifications = useAppSelector((state) => state.notificationsTab);

  return (
    <>
      <Tabs
        items={[
          {
            name: 'forYou',
            text: <FormattedMessage id='tabs_bar.for_you' defaultMessage='For You' />,
            action: () => setActiveTab('forYou'),
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
        {activeTab === 'forYou' ? <HomeTimeline /> : <CommunityTimeline />}
      </Suspense>
    </>
  );
};

export default MyNostrTimeline;