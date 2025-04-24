import clsx from 'clsx';
import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import { uploadCompose } from 'soapbox/actions/compose.ts';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Layout from 'soapbox/components/ui/layout.tsx';
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
  PocketWallet,
} from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useDraggedFiles } from 'soapbox/hooks/useDraggedFiles.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';

import ComposeForm from '../features/compose/components/compose-form.tsx';

interface IHomePage {
  children: React.ReactNode;
}

const HomePage: React.FC<IHomePage> = ({ children }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const soapboxConfig = useSoapboxConfig();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isGlobalPage = pathname === '/timeline/global';

  const hasPatron = soapboxConfig.extensions.getIn(['patron', 'enabled']) === true;
  const hasCrypto = typeof soapboxConfig.cryptoAddresses.getIn([0, 'ticker']) === 'string';
  const cryptoLimit = soapboxConfig.cryptoDonatePanel.get('limit', 0);

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const acct = account ? account.acct : '';
  const avatar = account ? account.avatar : '';

  const renderSuggestions = () => {
    if (features.suggestionsLocal && !isGlobalPage) {
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


        {children}

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {me && features.nostr && (
          <PocketWallet />
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
