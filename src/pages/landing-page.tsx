import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  WhoToFollowPanel,
} from 'soapbox/features/ui/util/async-components.ts';
import { useAppSelector, useFeatures } from 'soapbox/hooks/index.ts';

import { Layout } from '../components/ui/index.ts';

interface ILandingPage {
  children: React.ReactNode;
}

const LandingPage: React.FC<ILandingPage> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main className='space-y-3 pt-3 dark:divide-gray-800 sm:pt-0'>
        {children}

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
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

export default LandingPage;
