import React from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';

import { Column, Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import { MyGroupsPanel, NewGroupPanel, SuggestedGroupsPanel } from 'soapbox/features/ui/util/async-components';

interface IGroupsPage {
  children: React.ReactNode;
}

/** Page to display groups. */
const GroupsPage: React.FC<IGroupsPage> = ({ children }) => (
  <>
    <Layout.Main>
      <Column withHeader={false}>
        <div className='space-y-4'>
          {children}
        </div>
      </Column>
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <Routes>
        <Route path='/groups' element={<SuggestedGroupsPanel />} />
        <Route path='/groups/discover' element={<MyGroupsPanel />} />
      </Routes>

      <LinkFooter />
    </Layout.Aside>
  </>
);

export default GroupsPage;
