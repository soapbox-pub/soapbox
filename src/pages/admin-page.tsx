import { Layout } from 'soapbox/components/ui/index.ts';
import {
  LatestAccountsPanel,
} from 'soapbox/features/ui/util/async-components.ts';

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
        <LatestAccountsPanel limit={5} />
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default AdminPage;
