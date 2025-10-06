import Layout from '@/components/ui/layout.tsx';
import LinkFooter from '@/features/ui/components/link-footer.tsx';
import {
  PromoPanel,
  InstanceInfoPanel,
  InstanceModerationPanel,
} from '@/features/ui/util/async-components.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';
import { federationRestrictionsDisclosed } from '@/utils/state.ts';

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
