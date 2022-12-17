import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

import { fetchGroups } from 'soapbox/actions/groups';
import GroupCard from 'soapbox/components/group-card';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Spinner, Stack, Text } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';

import PlaceholderGroupCard from '../placeholder/components/placeholder-group-card';

import type { List as ImmutableList } from 'immutable';
import type { RootState } from 'soapbox/store';
import type { Group as GroupEntity } from 'soapbox/types/entities';

const getOrderedGroups = createSelector([
  (state: RootState) => state.groups.items,
  (state: RootState) => state.groups.isLoading,
  (state: RootState) => state.group_relationships,
], (groups, isLoading, group_relationships) => ({
  groups: (groups.toList().filter((item: GroupEntity | false) => !!item) as ImmutableList<GroupEntity>)
    .map((item) => item.set('relationship', group_relationships.get(item.id) || null))
    .filter((item) => item.relationship?.member)
    .sort((a, b) => a.display_name.localeCompare(b.display_name)),
  isLoading,
}));

const Groups: React.FC = () => {
  const dispatch = useDispatch();

  const { groups, isLoading } = useAppSelector((state) => getOrderedGroups(state));

  useEffect(() => {
    dispatch(fetchGroups());
  }, []);

  if (!groups) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = (
    <Stack space={6} alignItems='center' justifyContent='center' className='p-6 h-full'>
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
    </Stack>
  );

  return (
    <ScrollableList
      scrollKey='groups'
      emptyMessage={emptyMessage}
      itemClassName='py-3 last:pb-0'
      isLoading
      showLoading
      placeholderComponent={PlaceholderGroupCard}
      placeholderCount={3}
    >
      {groups.map((group) => (
        <Link to={`/groups/${group.id}`}>
          <GroupCard group={group as GroupEntity} />
        </Link>
      ))}
    </ScrollableList>
  );
};

export default Groups;
