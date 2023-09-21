import React from 'react';

import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'soapbox/hooks';

import { Layout } from '../components/ui';
import BundleContainer from '../features/ui/containers/bundle-container';

interface ILandingPage {
  children: React.ReactNode
}

const LandingPage: React.FC<ILandingPage> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main className='space-y-3 pt-3 dark:divide-gray-800 sm:pt-0'>
        {children}

        {!me && (
          <BundleContainer fetchComponent={CtaBanner}>
            {Component => <Component />}
          </BundleContainer>
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <BundleContainer fetchComponent={SignUpPanel}>
            {Component => <Component />}
          </BundleContainer>
        )}
        {features.trends && (
          <BundleContainer fetchComponent={TrendsPanel}>
            {Component => <Component limit={5} />}
          </BundleContainer>
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default LandingPage;
