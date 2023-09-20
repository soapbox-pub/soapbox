import React from 'react';

import { Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import { NewGroupPanel, SuggestedGroupsPanel } from 'soapbox/features/ui/util/async-components';

interface IGroupsPage {
  children: React.ReactNode
}

/** Page to display groups. */
const GroupsPendingPage: React.FC<IGroupsPage> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside>
      <BundleContainer fetchComponent={NewGroupPanel}>
        {Component => <Component key='new-group-panel' />}
      </BundleContainer>

      <BundleContainer fetchComponent={SuggestedGroupsPanel}>
        {Component => <Component key='suggested-groups-panel' />}
      </BundleContainer>

      <LinkFooter key='link-footer' />
    </Layout.Aside>
  </>
);

export default GroupsPendingPage;
