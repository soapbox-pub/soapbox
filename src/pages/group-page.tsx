import banIcon from '@tabler/icons/outline/ban.svg';
import eyeOffIcon from '@tabler/icons/outline/eye-off.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { useGroup, useGroupMembershipRequests } from 'soapbox/api/hooks';
import { Column, Icon, Layout, Stack, Text, Tabs } from 'soapbox/components/ui';
import GroupHeader from 'soapbox/features/group/components/group-header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  CtaBanner,
  GroupMediaPanel,
  SignUpPanel,
  SuggestedGroupsPanel,
} from 'soapbox/features/ui/util/async-components';
import { useFeatures, useOwnAccount } from 'soapbox/hooks';

import type { Group } from 'soapbox/schemas';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  media: { id: 'group.tabs.media', defaultMessage: 'Media' },
  tags: { id: 'group.tabs.tags', defaultMessage: 'Topics' },
});

interface IGroupPage {
  params?: {
    groupId?: string;
  };
  children: React.ReactNode;
}

const DeletedBlankslate = () => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-danger-200 p-3 dark:bg-danger-400/20'>
      <Icon
        src={trashIcon}
        className='size-6 text-danger-600 dark:text-danger-400'
      />
    </div>

    <Text theme='muted'>
      <FormattedMessage
        id='group.deleted.message'
        defaultMessage='This group has been deleted.'
      />
    </Text>
  </Stack>
);

const PrivacyBlankslate = () => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-gray-200 p-3 dark:bg-gray-800'>
      <Icon
        src={eyeOffIcon}
        className='size-6 text-gray-600 dark:text-gray-600'
      />
    </div>

    <Text theme='muted'>
      <FormattedMessage
        id='group.private.message'
        defaultMessage='Content is only visible to group members'
      />
    </Text>
  </Stack>
);

const BlockedBlankslate = ({ group }: { group: Group }) => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-danger-200 p-3 dark:bg-danger-400/20'>
      <Icon
        src={banIcon}
        className='size-6 text-danger-600 dark:text-danger-400'
      />
    </div>

    <Text theme='muted'>
      <FormattedMessage
        id='group.banned.message'
        defaultMessage='You are banned from {group}'
        values={{
          group: <Text theme='inherit' tag='span' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />,
        }}
      />
    </Text>
  </Stack>
);

/** Page to display a group. */
const GroupPage: React.FC<IGroupPage> = ({ params, children }) => {
  const intl = useIntl();
  const features = useFeatures();
  const match = useRouteMatch();
  const { account: me } = useOwnAccount();

  const id = params?.groupId || '';

  const { group } = useGroup(id);
  const { accounts: pending } = useGroupMembershipRequests(id);

  const isMember = !!group?.relationship?.member;
  const isBlocked = group?.relationship?.blocked_by;
  const isPrivate = group?.locked;
  const isDeleted = !!group?.deleted_at;

  const tabItems = useMemo(() => {
    const items = [];
    items.push({
      text: intl.formatMessage(messages.all),
      to: `/group/${group?.slug}`,
      name: '/group/:groupSlug',
    });

    if (features.groupsTags) {
      items.push({
        text: intl.formatMessage(messages.tags),
        to: `/group/${group?.slug}/tags`,
        name: '/group/:groupSlug/tags',
      });
    }

    items.push(
      {
        text: intl.formatMessage(messages.media),
        to: `/group/${group?.slug}/media`,
        name: '/group/:groupSlug/media',
      },
      {
        text: intl.formatMessage(messages.members),
        to: `/group/${group?.slug}/members`,
        name: '/group/:groupSlug/members',
        count: pending.length,
      },
    );

    return items;
  }, [features.groupsTags, pending.length, group?.slug]);

  const renderChildren = () => {
    if (isDeleted) {
      return <DeletedBlankslate />;
    } else if (!isMember && isPrivate) {
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
            key={`group-tabs-${id}`}
            items={tabItems}
            activeItem={match.path}
          />

          {renderChildren()}
        </Column>

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        <GroupMediaPanel group={group} />
        <SuggestedGroupsPanel />
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export default GroupPage;
