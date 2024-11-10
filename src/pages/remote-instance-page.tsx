import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  PromoPanel,
  InstanceInfoPanel,
  InstanceModerationPanel,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useOwnAccount } from 'soapbox/hooks';
import { federationRestrictionsDisclosed } from 'soapbox/utils/state';

import { Layout } from '../components/ui';

interface IRemoteInstancePage {
  params?: {
    instance?: string;
  };
  children: React.ReactNode;
}

/** Page for viewing a remote instance timeline. */
const RemoteInstancePage: React.FC<IRemoteInstancePage> = ({ children, params }) => {
  const host = params!.instance!;

  const { account } = useOwnAccount();
  const disclosed = useAppSelector(federationRestrictionsDisclosed);

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        <PromoPanel />
        <InstanceInfoPanel host={host} />
        {(disclosed || account?.admin) && (
          <InstanceModerationPanel host={host} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default RemoteInstancePage;
