import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { Column, Icon, Layout, Stack, Text } from 'soapbox/components/ui';
import GroupHeader from 'soapbox/features/group/components/group-header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  CtaBanner,
  GroupMediaPanel,
  SignUpPanel,
} from 'soapbox/features/ui/util/async-components';
import { useGroup, useOwnAccount } from 'soapbox/hooks';

import { Tabs } from '../components/ui';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
});

interface IGroupPage {
  params?: {
    id?: string
  }
  children: React.ReactNode
}

/** Page to display a group. */
const GroupPage: React.FC<IGroupPage> = ({ params, children }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const me = useOwnAccount();

  const id = params?.id || '';

  const { group } = useGroup(id);

  const isNonMember = !group?.relationship?.member;
  const isPrivate = group?.locked;

  // if ((group as any) === false) {
  //   return (
  //     <MissingIndicator />
  //   );
  // }

  const items = [
    {
      text: intl.formatMessage(messages.all),
      to: `/groups/${group?.id}`,
      name: '/groups/:id',
    },
    {
      text: intl.formatMessage(messages.members),
      to: `/groups/${group?.id}/members`,
      name: '/groups/:id/members',
    },
  ];

  return (
    <>
      <Layout.Main>
        <Column label={group ? group.display_name : ''} withHeader={false}>
          <GroupHeader group={group} />

          <Tabs
            items={items}
            activeItem={match.path}
          />

          {(isNonMember && isPrivate) ? (
            <Stack space={4} className='py-10' alignItems='center'>
              <div className='rounded-full bg-gray-200 p-3'>
                <Icon src={require('@tabler/icons/eye-off.svg')} className='h-6 w-6 text-gray-600' />
              </div>

              <Text theme='muted'>
                Content is only visible to group members
              </Text>
            </Stack>
          ) : children}
        </Column>

        {!me && (
          <BundleContainer fetchComponent={CtaBanner}>
            {Component => <Component key='cta-banner' />}
          </BundleContainer>
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <BundleContainer fetchComponent={SignUpPanel}>
            {Component => <Component key='sign-up-panel' />}
          </BundleContainer>
        )}
        <BundleContainer fetchComponent={GroupMediaPanel}>
          {Component => <Component group={group} />}
        </BundleContainer>
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default GroupPage;
