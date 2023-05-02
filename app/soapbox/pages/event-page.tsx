import React from 'react';
import { useHistory } from 'react-router-dom';

import { Column, Layout, Tabs } from 'soapbox/components/ui';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  EventHeader,
  CtaBanner,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

const getStatus = makeGetStatus();

interface IEventPage {
  params?: {
    statusId?: string
  }
  children: React.ReactNode
}

const EventPage: React.FC<IEventPage> = ({ params, children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  const history = useHistory();
  const statusId = params?.statusId!;

  const status = useAppSelector(state => getStatus(state, { id: statusId }));

  const event = status?.event;

  if (status && !event) {
    history.push(`/@${status.getIn(['account', 'acct'])}/posts/${status.id}`);
    return (
      <PlaceholderStatus />
    );
  }

  const pathname = history.location.pathname;
  const activeItem = pathname.endsWith('/discussion') ? 'discussion' : 'info';

  const tabs = status ? [
    {
      text: 'Information',
      to: `/@${status.getIn(['account', 'acct'])}/events/${status.id}`,
      name: 'info',
    },
    {
      text: 'Discussion',
      to: `/@${status.getIn(['account', 'acct'])}/events/${status.id}/discussion`,
      name: 'discussion',
    },
  ] : [];

  const showTabs = !['/participations', 'participation_requests'].some(path => pathname.endsWith(path));

  return (
    <>
      <Layout.Main>
        <Column label={event?.name} withHeader={false}>
          <div className='space-y-4'>
            <BundleContainer fetchComponent={EventHeader}>
              {Component => <Component status={status} />}
            </BundleContainer>

            {status && showTabs && (
              <Tabs key={`event-tabs-${status.id}`} items={tabs} activeItem={activeItem} />
            )}

            {children}
          </div>
        </Column>

        {!me && (
          <BundleContainer fetchComponent={CtaBanner}>
            {Component => <Component key='cta-banner' />}
          </BundleContainer>
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <BundleContainer fetchComponent={SignUpPanel}>
            {Component => <Component key='sign-up-panel' />}
          </BundleContainer>
        )}
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

export default EventPage;
