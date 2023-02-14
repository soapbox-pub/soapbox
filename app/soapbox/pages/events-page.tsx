import React from 'react';

import { Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  WhoToFollowPanel,
  TrendsPanel,
  NewEventPanel,
} from 'soapbox/features/ui/util/async-components';
import { useFeatures } from 'soapbox/hooks';

interface IEventsPage {
  children: React.ReactNode
}

/** Page to display events list. */
const EventsPage: React.FC<IEventsPage> = ({ children }) => {
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        <BundleContainer fetchComponent={NewEventPanel}>
          {Component => <Component key='new-event-panel' />}
        </BundleContainer>
        {features.trends && (
          <BundleContainer fetchComponent={TrendsPanel}>
            {Component => <Component limit={5} key='trends-panel' />}
          </BundleContainer>
        )}
        {features.suggestions && (
          <BundleContainer fetchComponent={WhoToFollowPanel}>
            {Component => <Component limit={3} key='wtf-panel' />}
          </BundleContainer>
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default EventsPage;
