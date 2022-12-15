import React from 'react';
// import { useRouteMatch } from 'react-router-dom';

import { Column, Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  NewGroupPanel,
  CtaBanner,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector } from 'soapbox/hooks';

// import { Tabs } from '../components/ui';

/** Page to display groups. */
const GroupsPage: React.FC = ({ children }) => {
  const me = useAppSelector(state => state.me);
  // const match = useRouteMatch();

  return (
    <>
      <Layout.Main>
        <Column withHeader={false}>
          <div className='space-y-4'>
            {/* <Tabs
              items={[
                {
                  text: 'My Groups',
                  to: '/groups',
                  name: '/groups',
                },
                {
                  text: 'Find Groups',
                  to: '/groups/explore',
                  name: '/groups/explore',
                },
              ]}
              activeItem={match.path}
            /> */}

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
        <BundleContainer fetchComponent={NewGroupPanel}>
          {Component => <Component key='new-group-panel' />}
        </BundleContainer>
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default GroupsPage;
