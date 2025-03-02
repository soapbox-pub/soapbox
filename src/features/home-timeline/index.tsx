import { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import Tabs from 'soapbox/components/ui/tabs.tsx';
import { CommunityTimeline, FollowsTimeline } from 'soapbox/features/ui/util/async-components.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

const HomeTimeline = () => {
  const { instance } = useInstance();

  const match = useRouteMatch();
  const notifications = useAppSelector((state) => state.notificationsTab);

  return (
    <>
      <div className='sticky top-11 z-50 bg-white black:bg-black dark:bg-primary-900 lg:top-0'>
        <Tabs
          items={[
            {
              to: '/',
              name: '/',
              text: <FormattedMessage id='tabs_bar.follows' defaultMessage='Follows' />,
              notification: notifications.home,
            },
            {
              to: '/timeline/local',
              name: '/timeline/local',
              text: <div className='block max-w-xs truncate'>{instance.title}</div>,
              notification: notifications.instance,
            },
          ]}
          activeItem={match.path}
        />
      </div>

      <Suspense fallback={<div className='p-4 text-center'><FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' /></div>}>
        <Switch>
          <Route path='/' exact component={FollowsTimeline} />
          <Route path='/timeline/local' exact component={CommunityTimeline} />
        </Switch>
      </Suspense>
    </>
  );
};

export default HomeTimeline;