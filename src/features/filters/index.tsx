import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchFilters, deleteFilter } from 'soapbox/actions/filters.ts';
import RelativeTimestamp from 'soapbox/components/relative-timestamp.tsx';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  heading: { id: 'column.filters', defaultMessage: 'Muted words' },
  home_timeline: { id: 'column.filters.home_timeline', defaultMessage: 'Home timeline' },
  public_timeline: { id: 'column.filters.public_timeline', defaultMessage: 'Public timeline' },
  notifications: { id: 'column.filters.notifications', defaultMessage: 'Notifications' },
  conversations: { id: 'column.filters.conversations', defaultMessage: 'Conversations' },
  accounts: { id: 'column.filters.accounts', defaultMessage: 'Accounts' },
  delete_error: { id: 'column.filters.delete_error', defaultMessage: 'Error deleting filter' },
  edit: { id: 'column.filters.edit', defaultMessage: 'Edit Filter' },
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
  const { filtersV2 } = useFeatures();

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
    <Column label={intl.formatMessage(messages.heading)}>
      <HStack className='mb-4' space={2} justifyContent='end'>
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
        {filters.map((filter) => {

          const truthMessageFilter = filter.filter_action === 'hide' ?
            <FormattedMessage id='filters.filters_list_hide_completely' defaultMessage='Hide content' /> :
            <FormattedMessage id='filters.filters_list_warn' defaultMessage='Display warning' />;

          const falseMessageFilter = (filter.filter_action === 'hide' ?
            <FormattedMessage id='filters.filters_list_drop' defaultMessage='Drop' /> :
            <FormattedMessage id='filters.filters_list_hide' defaultMessage='Hide' />);

          return (
            <div key={filter.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
              <Stack space={2}>
                <Stack className='grow' space={1}>
                  <Text weight='medium'>
                    <FormattedMessage id='filters.filters_list_phrases_label' defaultMessage='Keywords or phrases:' />
                    {' '} {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
                    <Text theme='muted' tag='span'>{filter.keywords.map(keyword => keyword.keyword).join(', ')}</Text>
                  </Text>
                  <Text weight='medium'>
                    <FormattedMessage id='filters.filters_list_context_label' defaultMessage='Filter contexts:' />
                    {' '} {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
                    <Text theme='muted' tag='span'>{filter.context.map(context => contexts[context] ? intl.formatMessage(contexts[context]) : context).join(', ')}</Text>
                  </Text>
                  <HStack space={4} wrap>
                    <Text weight='medium'>
                      {filtersV2 ? truthMessageFilter : falseMessageFilter}
                    </Text>
                    {filter.expires_at && (
                      <Text weight='medium'>
                        {new Date(filter.expires_at).getTime() <= Date.now()
                          ? <FormattedMessage id='filters.filters_list_expired' defaultMessage='Expired' />
                          : <RelativeTimestamp timestamp={filter.expires_at} className='whitespace-nowrap' futureDate />}
                      </Text>
                    )}
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
          );
        },
        )}
      </ScrollableList>
    </Column>
  );
};

export default Filters;
