import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { usePendingGroups } from 'soapbox/api/hooks';
import GroupCard from 'soapbox/components/group-card';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column, Stack, Text } from 'soapbox/components/ui';

import PlaceholderGroupCard from '../placeholder/components/placeholder-group-card';

const messages = defineMessages({
  label: { id: 'groups.pending.label', defaultMessage: 'Pending Requests' },
});

export default () => {
  const intl = useIntl();

  const { groups, isLoading } = usePendingGroups();

  const renderBlankslate = () => (
    <Stack
      space={4}
      alignItems='center'
      justifyContent='center'
      className='py-6'
      data-testid='pending-requests-blankslate'
    >
      <Stack space={2} className='max-w-sm'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage
            id='groups.pending.empty.title'
            defaultMessage='No pending requests'
          />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='groups.pending.empty.subtitle'
            defaultMessage='You have no pending requests at this time.'
          />
        </Text>
      </Stack>
    </Stack>
  );

  return (
    <Column label={intl.formatMessage(messages.label)}>
      <ScrollableList
        emptyMessage={renderBlankslate()}
        emptyMessageCard={false}
        isLoading={isLoading}
        itemClassName='pb-4 last:pb-0'
        placeholderComponent={PlaceholderGroupCard}
        placeholderCount={3}
        scrollKey='pending-group-requests'
        showLoading={isLoading && groups.length === 0}
      >
        {groups.map((group) => (
          <Link key={group.id} to={`/group/${group.slug}`}>
            <GroupCard group={group} />
          </Link>
        ))}
      </ScrollableList>
    </Column>
  );
};