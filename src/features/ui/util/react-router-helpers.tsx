import React, { Suspense } from 'react';
import { Redirect, Route, useHistory, RouteProps, RouteComponentProps, match as MatchType } from 'react-router-dom';

import { Layout } from 'soapbox/components/ui';
import { useOwnAccount, useSettings } from 'soapbox/hooks';

import ColumnForbidden from '../components/column-forbidden';
import ColumnLoading from '../components/column-loading';
import ColumnsArea from '../components/columns-area';

type PageProps = {
  params?: MatchType['params'];
  layout?: any;
  children: React.ReactNode;
};

interface IWrappedRoute extends RouteProps {
  component: React.LazyExoticComponent<any>;
  page?: React.ComponentType<PageProps>;
  content?: React.ReactNode;
  componentParams?: Record<string, any>;
  layout?: any;
  publicRoute?: boolean;
  staffOnly?: boolean;
  adminOnly?: boolean;
  developerOnly?: boolean;
}

const WrappedRoute: React.FC<IWrappedRoute> = ({
  component: Component,
  page: Page,
  content,
  componentParams = {},
  layout,
  publicRoute = false,
  staffOnly = false,
  adminOnly = false,
  developerOnly = false,
  ...rest
}) => {
  const history = useHistory();

  const { account } = useOwnAccount();
  const settings = useSettings();

  const renderComponent = ({ match }: RouteComponentProps) => {
    if (Page) {
      return (
        <Suspense fallback={renderLoading()}>
          <Page params={match.params} layout={layout} {...componentParams}>
            <Component params={match.params} {...componentParams}>
              {content}
            </Component>
          </Page>
        </Suspense>
      );
    }

    return (
      <Suspense fallback={renderLoading()}>
        <ColumnsArea layout={layout}>
          <Component params={match.params} {...componentParams}>
            {content}
          </Component>
        </ColumnsArea>
      </Suspense>
    );
  };

  const renderWithLayout = (children: JSX.Element) => (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside />
    </>
  );

  const renderLoading = () => renderWithLayout(<ColumnLoading />);
  const renderForbidden = () => renderWithLayout(<ColumnForbidden />);

  const loginRedirect = () => {
    const actualUrl = encodeURIComponent(`${history.location.pathname}${history.location.search}`);
    localStorage.setItem('soapbox:redirect_uri', actualUrl);
    return <Redirect to='/login' />;
  };

  const authorized = [
    account || publicRoute,
    developerOnly ? settings.get('isDeveloper') : true,
    staffOnly ? account && account.staff : true,
    adminOnly ? account && account.admin : true,
  ].every(c => c);

  if (!authorized) {
    if (!account) {
      return loginRedirect();
    } else {
      return renderForbidden();
    }
  }

  return <Route {...rest} render={renderComponent} />;
};

export {
  WrappedRoute,
};
