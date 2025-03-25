import { useLocation } from 'react-router-dom';

import Layout from 'soapbox/components/ui/layout.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  PocketWallet,
} from 'soapbox/features/ui/util/async-components.ts';
import { useWallet } from 'soapbox/features/zap/hooks/useHooks.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';

interface IDefaultPage {
  children: React.ReactNode;
}

const DefaultPage: React.FC<IDefaultPage> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const { wallet } = useWallet();
  const path = useLocation().pathname;
  const hasPocketWallet = wallet && path !== '/wallet';

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
        {hasPocketWallet && (
          <PocketWallet />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default DefaultPage;
