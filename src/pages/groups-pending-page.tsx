
import Layout from '@/components/ui/layout.tsx';
import LinkFooter from '@/features/ui/components/link-footer.tsx';
import { NewGroupPanel, SuggestedGroupsPanel } from '@/features/ui/util/async-components.ts';

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
