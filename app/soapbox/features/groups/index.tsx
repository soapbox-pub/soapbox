import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import GroupCard from 'soapbox/components/group-card';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useGroups, useFeatures } from 'soapbox/hooks';
import { PERMISSION_CREATE_GROUPS, hasPermission } from 'soapbox/utils/permissions';

import PlaceholderGroupCard from '../placeholder/components/placeholder-group-card';

import PendingGroupsRow from './components/pending-groups-row';
import TabBar, { TabItems } from './components/tab-bar';

import type { Group as GroupEntity } from 'soapbox/types/entities';

const Groups: React.FC = () => {
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const canCreateGroup = useAppSelector((state) => hasPermission(state, PERMISSION_CREATE_GROUPS));

  const { groups, isLoading } = useGroups();

  const createGroup = () => {
    dispatch(openModal('MANAGE_GROUP'));
  };

  const renderBlankslate = () => (
    <Stack space={4} alignItems='center' justifyContent='center' className='py-6'>
      <Stack space={2} className='max-w-sm'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage
            id='groups.empty.title'
            defaultMessage='No Groups yet'
          />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='groups.empty.subtitle'
            defaultMessage='Start discovering groups to join or create your own.'
          />
        </Text>
      </Stack>

      {canCreateGroup && (
        <Button
          className='self-center'
          onClick={createGroup}
          theme='secondary'
        >
          <FormattedMessage id='new_group_panel.action' defaultMessage='Create Group' />
        </Button>
      )}
    </Stack>
  );

  return (
    <Stack space={4}>
      {canCreateGroup && (
        <Button
          className='sm:w-fit sm:self-end xl:hidden'
          icon={require('@tabler/icons/circles.svg')}
          onClick={createGroup}
          theme='secondary'
          block
        >
          <FormattedMessage id='new_group_panel.action' defaultMessage='Create Group' />
        </Button>
      )}

      {features.groupsDiscovery && (
        <TabBar activeTab={TabItems.MY_GROUPS} />
      )}

      <PendingGroupsRow />

      <ScrollableList
        scrollKey='groups'
        emptyMessage={renderBlankslate()}
        emptyMessageCard={false}
        itemClassName='pb-4 last:pb-0'
        isLoading={isLoading}
        showLoading={isLoading && groups.length === 0}
        placeholderComponent={PlaceholderGroupCard}
        placeholderCount={3}
      >
        {groups.map((group) => (
          <Link key={group.id} to={`/groups/${group.id}`}>
            <GroupCard group={group as GroupEntity} />
          </Link>
        ))}
      </ScrollableList>
    </Stack>
  );
};

export default Groups;
