import React from 'react';

import { Column, Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import { NewGroupPanel } from 'soapbox/features/ui/util/async-components';

interface IGroupsPage {
  children: React.ReactNode
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
      <BundleContainer fetchComponent={NewGroupPanel}>
        {Component => <Component key='new-group-panel' />}
      </BundleContainer>
      <LinkFooter key='link-footer' />
    </Layout.Aside>
  </>
);

export default GroupsPage;
