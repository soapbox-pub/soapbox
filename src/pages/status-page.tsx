import Layout from '@/components/ui/layout.tsx';
import LinkFooter from '@/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  PocketWallet,
} from '@/features/ui/util/async-components.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';

interface IStatusPage {
  children: React.ReactNode;
}

const StatusPage: React.FC<IStatusPage> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const { account } = useOwnAccount();
  const hasPocketWallet = account?.ditto.accepts_zaps_cashu;

  return (
    <>
      <Layout.Main>
        {children}

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {me && features.nostr && hasPocketWallet && (
          <PocketWallet />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default StatusPage;
