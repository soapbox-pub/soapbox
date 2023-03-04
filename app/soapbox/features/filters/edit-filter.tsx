import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { createFilter, fetchFilter, updateFilter } from 'soapbox/actions/filters';
import List, { ListItem } from 'soapbox/components/list';
import MissingIndicator from 'soapbox/components/missing-indicator';
import { Button, Column, Form, FormActions, FormGroup, HStack, Input, Stack, Streamfield, Text, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';
import { normalizeFilter } from 'soapbox/normalizers';
import toast from 'soapbox/toast';

import type { StreamfieldComponent } from 'soapbox/components/ui/streamfield/streamfield';

interface IFilterField {
  keyword: string
  whole_word: boolean
}

interface IEditFilter {
  params: { id?: string }
}

const messages = defineMessages({
  subheading_add_new: { id: 'column.filters.subheading_add_new', defaultMessage: 'Add New Filter' },
  subheading_edit: { id: 'column.filters.subheading_edit', defaultMessage: 'Edit Filter' },
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
  edit: { id: 'column.filters.edit', defaultMessage: 'Edit Filter' },
  create_error: { id: 'column.filters.create_error', defaultMessage: 'Error adding filter' },
});

// const expirations = {
//   null: 'Never',
//   // 1800: '30 minutes',
//   // 3600: '1 hour',
//   // 21600: '6 hour',
//   // 43200: '12 hours',
//   // 86400 : '1 day',
//   // 604800: '1 week',
// };

const FilterField: StreamfieldComponent<IFilterField> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange = (key: string): React.ChangeEventHandler<HTMLInputElement> =>
    e => onChange({ ...value, [key]: e.currentTarget[e.currentTarget.type === 'checkbox' ? 'checked' : 'value'] });

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-2/5 grow'
        value={value.keyword}
        onChange={handleChange('keyword')}
        placeholder={intl.formatMessage(messages.keyword)}
      />
      <HStack alignItems='center' space={2}>
        <Toggle
          checked={value.whole_word}
          onChange={handleChange('whole_word')}
          icons={false}
        />

        <Text tag='span' theme='muted'>
          <FormattedMessage id='column.filters.whole_word' defaultMessage='Whole word' />
        </Text>
      </HStack>
    </HStack>
  );
};

const EditFilter: React.FC<IEditFilter> = ({ params }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState('');
  const [expiresAt] = useState('');
  const [homeTimeline, setHomeTimeline] = useState(true);
  const [publicTimeline, setPublicTimeline] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [conversations, setConversations] = useState(false);
  const [accounts, setAccounts] = useState(false);
  const [hide, setHide] = useState(false);
  const [keywords, setKeywords] = useState<{ id?: string, keyword: string, whole_word: boolean }[]>([{ keyword: '', whole_word: false }]);

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
    if (accounts) {
      context.push('account');
    }

    dispatch(params.id
      ? updateFilter(params.id, title, expiresAt, context, hide, keywords)
      : createFilter(title, expiresAt, context, hide, keywords)).then(() => {
      history.push('/filters');
    }).catch(() => {
      toast.error(intl.formatMessage(messages.create_error));
    });
  };

  const handleChangeKeyword = (keywords: { keyword: string, whole_word: boolean }[]) => setKeywords(keywords);

  const handleAddKeyword = () => setKeywords(keywords => [...keywords, { keyword: '', whole_word: false }]);

  const handleRemoveKeyword = (i: number) => setKeywords(keywords => keywords.filter((_, index) => index !== i));

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      dispatch(fetchFilter(params.id))?.then((res: any) => {
        if (res.filter) {
          const filter = normalizeFilter(res.filter);

          setTitle(filter.title);
          setHomeTimeline(filter.context.includes('home'));
          setPublicTimeline(filter.context.includes('public'));
          setNotifications(filter.context.includes('notifications'));
          setConversations(filter.context.includes('thread'));
          setAccounts(filter.context.includes('account'));
          setHide(filter.filter_action === 'hide');
          setKeywords(filter.keywords.toJS());
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
    }
  }, [params.id]);

  if (notFound) return <MissingIndicator />;

  return (
    <Column className='filter-settings-panel' label={intl.formatMessage(messages.subheading_add_new)}>
      <Form onSubmit={handleAddNew}>
        <FormGroup labelText={intl.formatMessage(messages.title)}>
          <Input
            required
            type='text'
            name='title'
            value={title}
            onChange={({ target }) => setTitle(target.value)}
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
          {features.filtersV2 && (
            <ListItem label={intl.formatMessage(messages.accounts)}>
              <Toggle
                name='accounts'
                checked={accounts}
                onChange={({ target }) => setAccounts(target.checked)}
              />
            </ListItem>
          )}
        </List>

        <List>
          <ListItem
            label={intl.formatMessage(features.filtersV2 ? messages.hide_header : messages.drop_header)}
            hint={intl.formatMessage(features.filtersV2 ? messages.hide_hint : messages.drop_hint)}
          >
            <Toggle
              name='hide'
              checked={hide}
              onChange={({ target }) => setHide(target.checked)}
            />
          </ListItem>
        </List>

        <Streamfield
          label={intl.formatMessage(messages.keywords)}
          component={FilterField}
          values={keywords}
          onChange={handleChangeKeyword}
          onAddItem={handleAddKeyword}
          onRemoveItem={handleRemoveKeyword}
          minItems={1}
          maxItems={features.filtersV2 ? Infinity : 1}
        />

        <FormActions>
          <Button type='submit' theme='primary' disabled={loading}>
            {intl.formatMessage(params.id ? messages.edit : messages.add_new)}
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export default EditFilter;
