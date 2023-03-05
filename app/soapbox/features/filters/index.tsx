import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchFilters, deleteFilter } from 'soapbox/actions/filters';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, CardTitle, Column, HStack, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  heading: { id: 'column.filters', defaultMessage: 'Muted words' },
  subheading_add_new: { id: 'column.filters.subheading_add_new', defaultMessage: 'Add New Filter' },
  title: { id: 'column.filters.title', defaultMessage: 'Title' },
  keyword: { id: 'column.filters.keyword', defaultMessage: 'Keyword or phrase' },
  keywords: { id: 'column.filters.keywords', defaultMessage: 'Keywords or phrases' },
  expires: { id: 'column.filters.expires', defaultMessage: 'Expire after' },
  expires_hint: { id: 'column.filters.expires_hint', defaultMessage: 'Expiration dates are not currently supported' },
  home_timeline: { id: 'column.filters.home_timeline', defaultMessage: 'Home timeline' },
  public_timeline: { id: 'column.filters.public_timeline', defaultMessage: 'Public timeline' },
  notifications: { id: 'column.filters.notifications', defaultMessage: 'Notifications' },
  conversations: { id: 'column.filters.conversations', defaultMessage: 'Conversations' },
  accounts: { id: 'column.filters.accounts', defaultMessage: 'Accounts' },
  drop_header: { id: 'column.filters.drop_header', defaultMessage: 'Drop instead of hide' },
  drop_hint: { id: 'column.filters.drop_hint', defaultMessage: 'Filtered posts will disappear irreversibly, even if filter is later removed' },
  hide_header: { id: 'column.filters.hide_header', defaultMessage: 'Hide completely' },
  hide_hint: { id: 'column.filters.hide_hint', defaultMessage: 'Completely hide the filtered content, instead of showing a warning' },
  whole_word_header: { id: 'column.filters.whole_word_header', defaultMessage: 'Whole word' },
  whole_word_hint: { id: 'column.filters.whole_word_hint', defaultMessage: 'When the keyword or phrase is alphanumeric only, it will only be applied if it matches the whole word' },
  add_new: { id: 'column.filters.add_new', defaultMessage: 'Add New Filter' },
  create_error: { id: 'column.filters.create_error', defaultMessage: 'Error adding filter' },
  delete_error: { id: 'column.filters.delete_error', defaultMessage: 'Error deleting filter' },
  subheading_filters: { id: 'column.filters.subheading_filters', defaultMessage: 'Current Filters' },
  edit: { id: 'column.filters.edit', defaultMessage: 'Edit' },
  delete: { id: 'column.filters.delete', defaultMessage: 'Delete' },
});

const contexts = {
  home: messages.home_timeline,
  public: messages.public_timeline,
  notifications: messages.notifications,
  thread: messages.conversations,
  account: messages.accounts,
};

const Filters = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const filters = useAppSelector((state) => state.filters);

  const handleFilterEdit = (id: string) => () => history.push(`/filters/${id}`);

  const handleFilterDelete = (id: string) => () => {
    dispatch(deleteFilter(id)).then(() => {
      return dispatch(fetchFilters(true));
    }).catch(() => {
      toast.error(intl.formatMessage(messages.delete_error));
    });
  };

  useEffect(() => {
    dispatch(fetchFilters(true));
  }, []);

  const emptyMessage = <FormattedMessage id='empty_column.filters' defaultMessage="You haven't created any muted words yet." />;

  return (
    <Column className='filter-settings-panel' label={intl.formatMessage(messages.heading)}>
      <HStack className='mb-4' space={2} justifyContent='between'>
        <CardTitle title={intl.formatMessage(messages.subheading_filters)} />
        <Button
          to='/filters/new'
          theme='primary'
          size='sm'
        >
          <FormattedMessage id='filters.create_filter' defaultMessage='Create filter' />
        </Button>
      </HStack>

      <ScrollableList
        scrollKey='filters'
        emptyMessage={emptyMessage}
        itemClassName='pb-4 last:pb-0'
      >
        {filters.map((filter, i) => (
          <div className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
            <Stack space={2}>
              <Stack className='grow' space={1}>
                <Text weight='medium'>
                  <FormattedMessage id='filters.filters_list_phrases_label' defaultMessage='Keywords or phrases:' />
                  {' '}
                  <Text theme='muted' tag='span'>{filter.keywords.map(keyword => keyword.keyword).join(', ')}</Text>
                </Text>
                <Text weight='medium'>
                  <FormattedMessage id='filters.filters_list_context_label' defaultMessage='Filter contexts:' />
                  {' '}
                  <Text theme='muted' tag='span'>{filter.context.map(context => contexts[context] ? intl.formatMessage(contexts[context]) : context).join(', ')}</Text>
                </Text>
                <HStack space={4}>
                  {/* <Text weight='medium'>
                   {filter.irreversible ?
                     <FormattedMessage id='filters.filters_list_drop' defaultMessage='Drop' /> :
                     <FormattedMessage id='filters.filters_list_hide' defaultMessage='Hide' />}
                 </Text>
                 {filter.whole_word && (
                   <Text weight='medium'>
                     <FormattedMessage id='filters.filters_list_whole-word' defaultMessage='Whole word' />
                   </Text>
                 )} */}
                </HStack>
              </Stack>
              <HStack space={2} justifyContent='end'>
                <Button theme='primary' onClick={handleFilterEdit(filter.id)}>
                  {intl.formatMessage(messages.edit)}
                </Button>
                <Button theme='danger' onClick={handleFilterDelete(filter.id)}>
                  {intl.formatMessage(messages.delete)}
                </Button>
              </HStack>
            </Stack>
          </div>
        ))}
      </ScrollableList>
    </Column>
  );
};

export default Filters;
