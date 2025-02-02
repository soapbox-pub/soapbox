import { debounce } from 'es-toolkit';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useSuggestions } from 'soapbox/queries/suggestions.ts';

const messages = defineMessages({
  heading: { id: 'follow_recommendations.heading', defaultMessage: 'Suggested Profiles' },
});

interface IFollowRecommendations {
  local?: boolean;
}

const FollowRecommendations: React.FC<IFollowRecommendations> = ({ local = false }) => {
  const intl = useIntl();

  const { data: suggestions, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useSuggestions({ local });

  const handleLoadMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, 1000);

  if (suggestions.length === 0 && !isLoading) {
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
          hasMore={hasNextPage}
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
