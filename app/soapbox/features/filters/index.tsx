import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchFilters, createFilter, deleteFilter } from 'soapbox/actions/filters';
import List, { ListItem } from 'soapbox/components/list';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, CardHeader, CardTitle, Column, Form, FormActions, FormGroup, HStack, IconButton, Input, Stack, Text, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  heading: { id: 'column.filters', defaultMessage: 'Muted words' },
  subheading_add_new: { id: 'column.filters.subheading_add_new', defaultMessage: 'Add New Filter' },
  keyword: { id: 'column.filters.keyword', defaultMessage: 'Keyword or phrase' },
  expires: { id: 'column.filters.expires', defaultMessage: 'Expire after' },
  expires_hint: { id: 'column.filters.expires_hint', defaultMessage: 'Expiration dates are not currently supported' },
  home_timeline: { id: 'column.filters.home_timeline', defaultMessage: 'Home timeline' },
  public_timeline: { id: 'column.filters.public_timeline', defaultMessage: 'Public timeline' },
  notifications: { id: 'column.filters.notifications', defaultMessage: 'Notifications' },
  conversations: { id: 'column.filters.conversations', defaultMessage: 'Conversations' },
  drop_header: { id: 'column.filters.drop_header', defaultMessage: 'Drop instead of hide' },
  drop_hint: { id: 'column.filters.drop_hint', defaultMessage: 'Filtered posts will disappear irreversibly, even if filter is later removed' },
  whole_word_header: { id: 'column.filters.whole_word_header', defaultMessage: 'Whole word' },
  whole_word_hint: { id: 'column.filters.whole_word_hint', defaultMessage: 'When the keyword or phrase is alphanumeric only, it will only be applied if it matches the whole word' },
  add_new: { id: 'column.filters.add_new', defaultMessage: 'Add New Filter' },
  create_error: { id: 'column.filters.create_error', defaultMessage: 'Error adding filter' },
  delete_error: { id: 'column.filters.delete_error', defaultMessage: 'Error deleting filter' },
  subheading_filters: { id: 'column.filters.subheading_filters', defaultMessage: 'Current Filters' },
  delete: { id: 'column.filters.delete', defaultMessage: 'Delete' },
});

const contexts = {
  home: messages.home_timeline,
  public: messages.public_timeline,
  notifications: messages.notifications,
  thread: messages.conversations,
};

// const expirations = {
//   null: 'Never',
//   // 3600: '30 minutes',
//   // 21600: '1 hour',
//   // 43200: '12 hours',
//   // 86400 : '1 day',
//   // 604800: '1 week',
// };

const Filters = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const filters = useAppSelector((state) => state.filters);

  const [phrase, setPhrase] = useState('');
  const [expiresAt] = useState('');
  const [homeTimeline, setHomeTimeline] = useState(true);
  const [publicTimeline, setPublicTimeline] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [conversations, setConversations] = useState(false);
  const [irreversible, setIrreversible] = useState(false);
  const [wholeWord, setWholeWord] = useState(true);

  // const handleSelectChange = e => {
  //   this.setState({ [e.target.name]: e.target.value });
  // };

  const handleAddNew: React.FormEventHandler = e => {
    e.preventDefault();
    const context: Array<string> = [];

    if (homeTimeline) {
      context.push('home');
    }
    if (publicTimeline) {
      context.push('public');
    }
    if (notifications) {
      context.push('notifications');
    }
    if (conversations) {
      context.push('thread');
    }

    dispatch(createFilter(phrase, expiresAt, context, wholeWord, irreversible)).then(() => {
      return dispatch(fetchFilters());
    }).catch(error => {
      toast.error(intl.formatMessage(messages.create_error));
    });
  };

  const handleFilterDelete = (id: string) => () => {
    dispatch(deleteFilter(id)).then(() => {
      return dispatch(fetchFilters());
    }).catch(() => {
      toast.error(intl.formatMessage(messages.delete_error));
    });
  };

  useEffect(() => {
    dispatch(fetchFilters());
  }, []);

  const emptyMessage = <FormattedMessage id='empty_column.filters' defaultMessage="You haven't created any muted words yet." />;

  return (
    <Column className='filter-settings-panel' label={intl.formatMessage(messages.heading)}>
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading_add_new)} />
      </CardHeader>
      <Form onSubmit={handleAddNew}>
        <FormGroup labelText={intl.formatMessage(messages.keyword)}>
          <Input
            required
            type='text'
            name='phrase'
            onChange={({ target }) => setPhrase(target.value)}
          />
        </FormGroup>
        {/* <FormGroup labelText={intl.formatMessage(messages.expires)} hintText={intl.formatMessage(messages.expires_hint)}>
          <SelectDropdown
            items={expirations}
            defaultValue={expirations.never}
            onChange={this.handleSelectChange}
          />
        </FormGroup> */}

        <Stack>
          <Text size='sm' weight='medium'>
            <FormattedMessage id='filters.context_header' defaultMessage='Filter contexts' />
          </Text>
          <Text size='xs' theme='muted'>
            <FormattedMessage id='filters.context_hint' defaultMessage='One or multiple contexts where the filter should apply' />
          </Text>
        </Stack>

        <List>
          <ListItem label={intl.formatMessage(messages.home_timeline)}>
            <Toggle
              name='home_timeline'
              checked={homeTimeline}
              onChange={({ target }) => setHomeTimeline(target.checked)}
            />
          </ListItem>
          <ListItem label={intl.formatMessage(messages.public_timeline)}>
            <Toggle
              name='public_timeline'
              checked={publicTimeline}
              onChange={({ target }) => setPublicTimeline(target.checked)}
            />
          </ListItem>
          <ListItem label={intl.formatMessage(messages.notifications)}>
            <Toggle
              name='notifications'
              checked={notifications}
              onChange={({ target }) => setNotifications(target.checked)}
            />
          </ListItem>
          <ListItem label={intl.formatMessage(messages.conversations)}>
            <Toggle
              name='conversations'
              checked={conversations}
              onChange={({ target }) => setConversations(target.checked)}
            />
          </ListItem>
        </List>

        <List>
          <ListItem
            label={intl.formatMessage(messages.drop_header)}
            hint={intl.formatMessage(messages.drop_hint)}
          >
            <Toggle
              name='irreversible'
              checked={irreversible}
              onChange={({ target }) => setIrreversible(target.checked)}
            />
          </ListItem>
          <ListItem
            label={intl.formatMessage(messages.whole_word_header)}
            hint={intl.formatMessage(messages.whole_word_hint)}
          >
            <Toggle
              name='whole_word'
              checked={wholeWord}
              onChange={({ target }) => setWholeWord(target.checked)}
            />
          </ListItem>
        </List>

        <FormActions>
          <Button type='submit' theme='primary'>{intl.formatMessage(messages.add_new)}</Button>
        </FormActions>
      </Form>

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading_filters)} />
      </CardHeader>

      <ScrollableList
        scrollKey='filters'
        emptyMessage={emptyMessage}
        itemClassName='pb-4 last:pb-0'
      >
        {filters.map((filter, i) => (
          <HStack space={1} justifyContent='between'>
            <Stack space={1}>
              <Text weight='medium'>
                <FormattedMessage id='filters.filters_list_phrase_label' defaultMessage='Keyword or phrase:' />
                {' '}
                <Text theme='muted' tag='span'>{filter.phrase}</Text>
              </Text>
              <Text weight='medium'>
                <FormattedMessage id='filters.filters_list_context_label' defaultMessage='Filter contexts:' />
                {' '}
                <Text theme='muted' tag='span'>{filter.context.map(context => contexts[context] ? intl.formatMessage(contexts[context]) : context).join(', ')}</Text>
              </Text>
              <HStack space={4}>
                <Text weight='medium'>
                  {filter.irreversible ?
                    <FormattedMessage id='filters.filters_list_drop' defaultMessage='Drop' /> :
                    <FormattedMessage id='filters.filters_list_hide' defaultMessage='Hide' />}
                </Text>
                {filter.whole_word && (
                  <Text weight='medium'>
                    <FormattedMessage id='filters.filters_list_whole-word' defaultMessage='Whole word' />
                  </Text>
                )}
              </HStack>
            </Stack>
            <IconButton
              iconClassName='h-5 w-5 text-gray-700 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-500'
              src={require('@tabler/icons/trash.svg')}
              onClick={handleFilterDelete(filter.id)}
              title={intl.formatMessage(messages.delete)}
            />
          </HStack>
        ))}
      </ScrollableList>
    </Column>
  );
};

export default Filters;
