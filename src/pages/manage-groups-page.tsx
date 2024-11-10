
import { Layout } from 'soapbox/components/ui/index.ts';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import { MyGroupsPanel, NewGroupPanel } from 'soapbox/features/ui/util/async-components.ts';

interface IGroupsPage {
  children: React.ReactNode;
}

/** Page to display groups. */
const ManageGroupsPage: React.FC<IGroupsPage> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <MyGroupsPanel />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export default ManageGroupsPage;
