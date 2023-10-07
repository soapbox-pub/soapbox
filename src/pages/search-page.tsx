import React from 'react';

import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
  SuggestedGroupsPanel,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'soapbox/hooks';

import { Layout } from '../components/ui';

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

        {me && features.suggestions && (
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
