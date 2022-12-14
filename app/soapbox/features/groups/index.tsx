import React, { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

import { fetchGroups } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import Icon from 'soapbox/components/icon';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Column, HStack, Spinner } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';

import type { RootState } from 'soapbox/store';

const messages = defineMessages({
  heading: { id: 'column.groups', defaultMessage: 'Groups' },
});

const getOrderedGroups = createSelector([
  (state: RootState) => state.groups,
  (state: RootState) => state.group_relationships,
], (groups, group_relationships) => {
  if (!groups) {
    return groups;
  }

  return groups.toList().filter(item => !!item && group_relationships.get(item.id)?.member).sort((a, b) => a.display_name.localeCompare(b.display_name));
});

const Lists: React.FC = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const groups = useAppSelector((state) => getOrderedGroups(state));

  useEffect(() => {
    dispatch(fetchGroups());
  }, []);

  const onCreateGroup = () => {
    dispatch(openModal('MANAGE_GROUP'));
  };

  if (!groups) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.groups' defaultMessage='You are not in any group yet. When you join one, it will show up here.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <HStack>
        <Button
          className='ml-auto'
          theme='primary'
          size='sm'
          onClick={onCreateGroup}
        >
          <FormattedMessage id='groups.create_group' defaultMessage='Create group' />
        </Button>
      </HStack>
      <div className='space-y-4'>
        <ScrollableList
          scrollKey='lists'
          emptyMessage={emptyMessage}
          itemClassName='py-2'
        >
          {groups.map((group: any) => (
            <Link key={group.id} to={`/groups/${group.id}`} className='flex items-center gap-1.5 p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg'>
              <Icon src={require('@tabler/icons/users.svg')} fixedWidth />
              <span className='flex-grow' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
            </Link>
          ))}
        </ScrollableList>
      </div>
    </Column>
  );
};

export default Lists;
