import React from 'react';

import { Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import { NewGroupPanel, SuggestedGroupsPanel } from 'soapbox/features/ui/util/async-components';

interface IGroupsPage {
  children: React.ReactNode;
}

/** Page to display groups. */
const GroupsPendingPage: React.FC<IGroupsPage> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <SuggestedGroupsPanel />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export default GroupsPendingPage;
