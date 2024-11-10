import Layout from 'soapbox/components/ui/layout.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  SuggestedGroupsPanel,
} from 'soapbox/features/ui/util/async-components.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';

interface ISearchPage {
  children: React.ReactNode;
}

const SearchPage: React.FC<ISearchPage> = ({ children }) => {
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

export default SearchPage;
