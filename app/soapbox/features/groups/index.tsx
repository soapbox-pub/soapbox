import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import { useGroups } from 'soapbox/api/hooks';
import GroupCard from 'soapbox/components/group-card';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Input, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useDebounce, useFeatures } from 'soapbox/hooks';
import { PERMISSION_CREATE_GROUPS, hasPermission } from 'soapbox/utils/permissions';

import PlaceholderGroupCard from '../placeholder/components/placeholder-group-card';

import PendingGroupsRow from './components/pending-groups-row';
import TabBar, { TabItems } from './components/tab-bar';

const messages = defineMessages({
  placeholder: { id: 'groups.search.placeholder', defaultMessage: 'Search My Groups' },
});

const Groups: React.FC = () => {
  const debounce = useDebounce;
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const canCreateGroup = useAppSelector((state) => hasPermission(state, PERMISSION_CREATE_GROUPS));

  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedValue = debounce(searchValue, 300);

  const { groups, isLoading, hasNextPage, fetchNextPage } = useGroups(debouncedValue);

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const createGroup = () => dispatch(openModal('CREATE_GROUP'));

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
      {features.groupsDiscovery && (
        <TabBar activeTab={TabItems.MY_GROUPS} />
      )}

      {canCreateGroup && (
        <Button
          className='xl:hidden'
          icon={require('@tabler/icons/circles.svg')}
          onClick={createGroup}
          theme='secondary'
          block
        >
          <FormattedMessage id='new_group_panel.action' defaultMessage='Create Group' />
        </Button>
      )}

      {features.groupsSearch ? (
        <Input
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={intl.formatMessage(messages.placeholder)}
          theme='search'
          value={searchValue}
        />
      ) : null}

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
        onLoadMore={handleLoadMore}
        hasMore={hasNextPage}
      >
        {groups.map((group) => (
          <Link key={group.id} to={`/group/${group.slug}`}>
            <GroupCard group={group} />
          </Link>
        ))}
      </ScrollableList>
    </Stack>
  );
};

export default Groups;
