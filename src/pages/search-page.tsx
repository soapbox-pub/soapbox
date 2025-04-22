import { useLocation } from 'react-router-dom';

import Layout from 'soapbox/components/ui/layout.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  LatestAccountsPanel,
  SuggestedGroupsPanel,
  PocketWallet,
} from 'soapbox/features/ui/util/async-components.ts';
import { useWallet } from 'soapbox/features/zap/hooks/useHooks.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';

interface IExplorePage {
  children: React.ReactNode;
}

const ExplorePage: React.FC<IExplorePage> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const accountsPath = useLocation().pathname === '/explore/accounts';
  const { wallet } = useWallet();

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

        {wallet && (
          <PocketWallet />
        )}

        {features.trends && (
          <TrendsPanel limit={5} />
        )}

        {features.suggestions && (accountsPath
          ? <LatestAccountsPanel limit={3} />
          : <WhoToFollowPanel limit={3} />
        )}

        {features.groups && (
          <SuggestedGroupsPanel />
        )}

        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default ExplorePage;
