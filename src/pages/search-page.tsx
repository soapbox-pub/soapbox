import Layout from '@/components/ui/layout.tsx';
import LinkFooter from '@/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  SuggestedGroupsPanel,
} from '@/features/ui/util/async-components.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';

interface IExplorePage {
  children: React.ReactNode;
}

const ExplorePage: React.FC<IExplorePage> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

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

        {features.trends && (
          <TrendsPanel limit={5} />
        )}

        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
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
