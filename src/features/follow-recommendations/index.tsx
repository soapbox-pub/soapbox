import debounce from 'lodash/debounce';
import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchSuggestions } from 'soapbox/actions/suggestions.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks/index.ts';

const messages = defineMessages({
  heading: { id: 'follow_recommendations.heading', defaultMessage: 'Suggested Profiles' },
});

const FollowRecommendations: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const suggestions = useAppSelector((state) => state.suggestions.items);
  const hasMore = useAppSelector((state) => !!state.suggestions.next);
  const isLoading = useAppSelector((state) => state.suggestions.isLoading);

  const handleLoadMore = debounce(() => {
    if (isLoading) {
      return null;
    }

    return dispatch(fetchSuggestions({ limit: 20 }));
  }, 300);

  useEffect(() => {
    dispatch(fetchSuggestions({ limit: 20 }));
  }, []);

  if (suggestions.size === 0 && !isLoading) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Text align='center'>
          <FormattedMessage id='empty_column.follow_recommendations' defaultMessage='Looks like no suggestions could be generated for you. You can try using search to look for people you might know or explore trending hashtags.' />
        </Text>
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <ScrollableList
          isLoading={isLoading}
          scrollKey='suggestions'
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          itemClassName='pb-4'
        >
          {suggestions.map((suggestion) => (
            <AccountContainer
              key={suggestion.account}
              id={suggestion.account}
              withAccountNote
            />
          ))}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export default FollowRecommendations;
