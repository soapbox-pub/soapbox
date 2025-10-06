import Layout from '@/components/ui/layout.tsx';
import { LatestAdminAccountsPanel } from '@/features/ui/util/async-components.ts';

import LinkFooter from '../features/ui/components/link-footer.tsx';

interface IAdminPage {
  children: React.ReactNode;
}

const AdminPage: React.FC<IAdminPage> = ({ children }) => {
  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        <LatestAdminAccountsPanel limit={5} />
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default AdminPage;
