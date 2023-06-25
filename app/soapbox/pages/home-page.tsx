import clsx from 'clsx';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { uploadCompose } from 'soapbox/actions/compose';
import FeedCarousel from 'soapbox/features/feed-filtering/feed-carousel';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
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
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useOwnAccount, useFeatures, useSoapboxConfig, useDraggedFiles, useAppDispatch } from 'soapbox/hooks';

import { Avatar, Card, CardBody, HStack, Layout } from '../components/ui';
import ComposeForm from '../features/compose/components/compose-form';
import BundleContainer from '../features/ui/containers/bundle-container';

interface IHomePage {
  children: React.ReactNode
}

const HomePage: React.FC<IHomePage> = ({ children }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const soapboxConfig = useSoapboxConfig();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);

  const hasPatron = soapboxConfig.extensions.getIn(['patron', 'enabled']) === true;
  const hasCrypto = typeof soapboxConfig.cryptoAddresses.getIn([0, 'ticker']) === 'string';
  const cryptoLimit = soapboxConfig.cryptoDonatePanel.get('limit', 0);

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const acct = account ? account.acct : '';
  const avatar = account ? account.avatar : '';

  return (
    <>
      <Layout.Main className='space-y-3 pt-3 dark:divide-gray-800 sm:pt-0'>
        {me && (
          <Card
            className={clsx('relative z-[1] transition', {
              'border-2 border-primary-600 border-dashed z-[99]': isDragging,
              'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
            })}
            variant='rounded'
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

        {features.carousel && <FeedCarousel />}

        {children}

        {!me && (
          <BundleContainer fetchComponent={CtaBanner}>
            {Component => <Component key='cta-banner' />}
          </BundleContainer>
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <BundleContainer fetchComponent={SignUpPanel}>
            {Component => <Component />}
          </BundleContainer>
        )}
        {me && features.announcements && (
          <BundleContainer fetchComponent={AnnouncementsPanel}>
            {Component => <Component key='announcements-panel' />}
          </BundleContainer>
        )}
        {features.trends && (
          <BundleContainer fetchComponent={TrendsPanel}>
            {Component => <Component limit={5} />}
          </BundleContainer>
        )}
        {hasPatron && (
          <BundleContainer fetchComponent={FundingPanel}>
            {Component => <Component />}
          </BundleContainer>
        )}
        {hasCrypto && cryptoLimit > 0 && (
          <BundleContainer fetchComponent={CryptoDonatePanel}>
            {Component => <Component limit={cryptoLimit} />}
          </BundleContainer>
        )}
        <BundleContainer fetchComponent={PromoPanel}>
          {Component => <Component />}
        </BundleContainer>
        {features.birthdays && (
          <BundleContainer fetchComponent={BirthdayPanel}>
            {Component => <Component limit={10} />}
          </BundleContainer>
        )}
        {me && features.suggestions && (
          <BundleContainer fetchComponent={WhoToFollowPanel}>
            {Component => <Component limit={3} />}
          </BundleContainer>
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default HomePage;
