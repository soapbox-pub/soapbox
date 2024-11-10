import Layout from 'soapbox/components/ui/layout.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  PromoPanel,
  InstanceInfoPanel,
  InstanceModerationPanel,
} from 'soapbox/features/ui/util/async-components.ts';
import { useAppSelector, useOwnAccount } from 'soapbox/hooks/index.ts';
import { federationRestrictionsDisclosed } from 'soapbox/utils/state.ts';

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
