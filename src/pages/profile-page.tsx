import { FormattedMessage } from 'react-intl';
import { Redirect, useHistory } from 'react-router-dom';

import { useAccountLookup } from 'soapbox/api/hooks/index.ts';
import { Column } from 'soapbox/components/ui/column.tsx';
import Layout from 'soapbox/components/ui/layout.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Tabs from 'soapbox/components/ui/tabs.tsx';
import Header from 'soapbox/features/account/components/header.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  ProfileInfoPanel,
  ProfileMediaPanel,
  ProfileFieldsPanel,
  SignUpPanel,
  CtaBanner,
  PinnedAccountsPanel,
  AccountNotePanel,
  PocketWallet,
} from 'soapbox/features/ui/util/async-components.ts';
import { useWallet } from 'soapbox/features/zap/hooks/useHooks.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { getAcct } from 'soapbox/utils/accounts.ts';

interface IProfilePage {
  params?: {
    username?: string;
  };
  children: React.ReactNode;
}

/** Page to display a user's profile. */
const ProfilePage: React.FC<IProfilePage> = ({ params, children }) => {
  const history = useHistory();
  const username = params?.username || '';

  const { account } = useAccountLookup(username, { withRelationship: true });

  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const { displayFqn } = useSoapboxConfig();
  const { wallet } = useWallet();

  // Fix case of username
  if (account && account.acct !== username) {
    return <Redirect to={`/@${account.acct}`} />;
  }

  const tabItems = [
    {
      text: <FormattedMessage id='account.posts' defaultMessage='Posts' />,
      to: `/@${username}`,
      name: 'profile',
    },
    {
      text: <FormattedMessage id='account.posts_with_replies' defaultMessage='Posts & replies' />,
      to: `/@${username}/with_replies`,
      name: 'replies',
    },
    {
      text: <FormattedMessage id='account.media' defaultMessage='Media' />,
      to: `/@${username}/media`,
      name: 'media',
    },
  ];

  if (account) {
    const ownAccount = account.id === me;
    if (ownAccount || account.pleroma?.hide_favorites === false) {
      tabItems.push({
        text: <FormattedMessage id='navigation_bar.favourites' defaultMessage='Likes' />,
        to: `/@${account.acct}/favorites`,
        name: 'likes',
      });
    }
  }

  let activeItem;
  const pathname = history.location.pathname.replace(`@${username}/`, '');
  if (pathname.endsWith('/with_replies')) {
    activeItem = 'replies';
  } else if (pathname.endsWith('/media')) {
    activeItem = 'media';
  } else if (pathname.endsWith('/favorites')) {
    activeItem = 'likes';
  } else {
    activeItem = 'profile';
  }

  const showTabs = !['/following', '/followers', '/pins'].some(path => pathname.endsWith(path));

  return (
    <>
      <Layout.Main>
        <Column size='lg' label={account ? `@${getAcct(account, displayFqn)}` : ''} withHeader={false} slim>
          <Stack space={4}>
            <Header account={account} />

            <Stack space={4} className='px-6'>
              <ProfileInfoPanel username={username} account={account} />

              {account && showTabs && (
                <Tabs key={`profile-tabs-${account.id}`} items={tabItems} activeItem={activeItem} />
              )}
            </Stack>

            {children}
          </Stack>
        </Column>

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}

        {wallet && (
          <PocketWallet />
        )}

        {features.notes && account && account?.id !== me && (
          <AccountNotePanel account={account} />
        )}
        <ProfileMediaPanel account={account} />
        {(account && account.fields.length > 0) && (
          <ProfileFieldsPanel account={account} />
        )}
        {(features.accountEndorsements && account && account.local) ? (
          <PinnedAccountsPanel account={account} limit={5} />
        ) : me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default ProfilePage;
