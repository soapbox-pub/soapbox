import clsx from 'clsx';
import { useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { uploadCompose } from 'soapbox/actions/compose.ts';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Layout from 'soapbox/components/ui/layout.tsx';
import Tabs from 'soapbox/components/ui/tabs.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  PromoPanel,
  FundingPanel,
  CryptoDonatePanel,
  BirthdayPanel,
  CtaBanner,
  AnnouncementsPanel,
  LatestAccountsPanel,
} from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useDraggedFiles } from 'soapbox/hooks/useDraggedFiles.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { RootState } from 'soapbox/store.ts';

import ComposeForm from '../features/compose/components/compose-form.tsx';

interface IHomePage {
  children: React.ReactNode;
}

const HomePage: React.FC<IHomePage> = ({ children }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const notifications = useSelector((state: RootState) => state.notificationsTab);

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const soapboxConfig = useSoapboxConfig();
  const { instance } = useInstance();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const hasPatron = soapboxConfig.extensions.getIn(['patron', 'enabled']) === true;
  const hasCrypto = typeof soapboxConfig.cryptoAddresses.getIn([0, 'ticker']) === 'string';
  const cryptoLimit = soapboxConfig.cryptoDonatePanel.get('limit', 0);

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const acct = account ? account.acct : '';
  const avatar = account ? account.avatar : '';

  const renderSuggestions = () => {
    if (features.suggestionsLocal && pathname !== '/timeline/global') {
      return <LatestAccountsPanel limit={3} />;
    } else if (features.suggestions) {
      return <WhoToFollowPanel limit={3} />;
    }
  };

  return (
    <>
      <Layout.Main className={clsx('space-y-0 dark:divide-gray-800')}>
        {me && (
          <Card
            className={clsx('relative z-[1] border-b border-gray-200 transition black:border-gray-800 dark:border-gray-800', {
              'border-2 border-primary-600 border-dashed z-[99]': isDragging,
              'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
              'border-b': isMobile,
            })}
            ref={composeBlock}
          >
            <CardBody>
              <HStack alignItems='start' space={4}>
                <Link to={`/@${acct}`}>
                  <Avatar src={avatar} size={46} />
                </Link>

                <div className='w-full translate-y-0.5'>
                  <ComposeForm
                    id={composeId}
                    shouldCondense
                    autoFocus={false}
                    clickableAreaRef={composeBlock}
                  />
                </div>
              </HStack>
            </CardBody>
          </Card>
        )}

        <div className='sticky top-12 z-20 bg-white/90 backdrop-blur black:bg-black/90 dark:bg-primary-900/90 lg:top-0'>
          <Tabs
            items={[
              { name: 'home', text: <FormattedMessage id='tabs_bar.home' defaultMessage='Home' />, to: '/', notification: notifications.home },
              { name: 'local', text: <div className='block max-w-xs truncate'>{instance.domain}</div>, to: '/timeline/local', notification: notifications.instance },
            ]}
            activeItem={pathname === '/timeline/local' ? 'local' : 'home'}
          />
        </div>

        {children}

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {me && features.announcements && (
          <AnnouncementsPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {renderSuggestions()}
        {features.birthdays && (
          <BirthdayPanel limit={10} />
        )}
        <PromoPanel />
        {(hasCrypto && cryptoLimit > 0 && me) && (
          <CryptoDonatePanel limit={cryptoLimit} />
        )}
        {(hasPatron && me) && (
          <FundingPanel />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default HomePage;
