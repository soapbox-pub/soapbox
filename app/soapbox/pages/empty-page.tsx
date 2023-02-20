import React from 'react';

import { Layout } from '../components/ui';

interface IEmptyPage {
  children: React.ReactNode
}

const EmptyPage: React.FC<IEmptyPage> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside />
  </>
);

export default EmptyPage;
