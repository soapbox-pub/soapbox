import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import GroupLookupHoc from 'soapbox/components/hoc/group-lookup-hoc';
import { Column, Icon, Layout, Stack, Text } from 'soapbox/components/ui';
import GroupHeader from 'soapbox/features/group/components/group-header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  CtaBanner,
  GroupMediaPanel,
  SignUpPanel,
  SuggestedGroupsPanel,
} from 'soapbox/features/ui/util/async-components';
import { useOwnAccount } from 'soapbox/hooks';
import { useGroup } from 'soapbox/hooks/api';
import { useGroupMembershipRequests } from 'soapbox/hooks/api/groups/useGroupMembershipRequests';
import { Group } from 'soapbox/schemas';

import { Tabs } from '../components/ui';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  media: { id: 'group.tabs.media', defaultMessage: 'Media' },
});

interface IGroupPage {
  params?: {
    groupId?: string
  }
  children: React.ReactNode
}

const PrivacyBlankslate = () => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-gray-200 p-3'>
      <Icon src={require('@tabler/icons/eye-off.svg')} className='h-6 w-6 text-gray-600' />
    </div>

    <Text theme='muted'>
      Content is only visible to group members
    </Text>
  </Stack>
);

const BlockedBlankslate = ({ group }: { group: Group }) => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-danger-200 p-3'>
      <Icon src={require('@tabler/icons/eye-off.svg')} className='h-6 w-6 text-danger-600' />
    </div>

    <Text theme='muted'>
      You are banned from
      {' '}
      <Text theme='inherit' tag='span' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
    </Text>
  </Stack>
);

/** Page to display a group. */
const GroupPage: React.FC<IGroupPage> = ({ params, children }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const me = useOwnAccount();

  const id = params?.groupId || '';

  const { group } = useGroup(id);
  const { accounts: pending } = useGroupMembershipRequests(id);

  const isMember = !!group?.relationship?.member;
  const isBlocked = group?.relationship?.blocked_by;
  const isPrivate = group?.locked;

  const items = [
    {
      text: intl.formatMessage(messages.all),
      to: group?.slug ? `/group/${group.slug}` : `/groups/${group?.id}`,
      name: group?.slug ? '/group/:groupSlug' : '/groups/:groupId',
    },
    {
      text: intl.formatMessage(messages.members),
      to: group?.slug ? `/group/${group.slug}/members` : `/groups/${group?.id}/members`,
      name: group?.slug ? '/group/:groupSlug/members' : '/groups/:groupId/members',
      count: pending.length,
    },
    {
      text: intl.formatMessage(messages.media),
      to: group?.slug ? `/group/${group.slug}/media` : `/groups/${group?.id}/media`,
      name: group?.slug ? '/group/:groupSlug' : '/groups/:groupId/media',
    },
  ];

  const renderChildren = () => {
    if (!isMember && isPrivate) {
      return <PrivacyBlankslate />;
    } else if (isBlocked) {
      return <BlockedBlankslate group={group} />;
    } else {
      return children;
    }
  };

  return (
    <>
      <Layout.Main>
        <Column size='lg' label={group ? group.display_name : ''} withHeader={false}>
          <GroupHeader group={group} />

          <Tabs
            items={items}
            activeItem={match.path}
          />

          {renderChildren()}
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
        <BundleContainer fetchComponent={SuggestedGroupsPanel}>
          {Component => <Component />}
        </BundleContainer>
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default GroupLookupHoc(GroupPage as any) as any;
