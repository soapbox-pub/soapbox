import React from 'react';

import { Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import { MyGroupsPanel, NewGroupPanel } from 'soapbox/features/ui/util/async-components';

interface IGroupsPage {
  children: React.ReactNode
}

/** Page to display groups. */
const ManageGroupsPage: React.FC<IGroupsPage> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside>
      <BundleContainer fetchComponent={NewGroupPanel}>
        {Component => <Component />}
      </BundleContainer>
      <BundleContainer fetchComponent={MyGroupsPanel}>
        {Component => <Component />}
      </BundleContainer>

      <LinkFooter />
    </Layout.Aside>
  </>
);

export default ManageGroupsPage;
