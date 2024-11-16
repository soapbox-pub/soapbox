
import Layout from 'soapbox/components/ui/layout.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import { NewGroupPanel, SuggestedGroupsPanel } from 'soapbox/features/ui/util/async-components.ts';

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
