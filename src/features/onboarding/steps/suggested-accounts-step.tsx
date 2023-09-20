import debounce from 'lodash/debounce';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'soapbox/components/big-card';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Stack, Text } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useOnboardingSuggestions } from 'soapbox/queries/suggestions';

const SuggestedAccountsStep = ({ onNext }: { onNext: () => void }) => {
  const { data, fetchNextPage, hasNextPage, isFetching } = useOnboardingSuggestions();

  const handleLoadMore = debounce(() => {
    if (isFetching) {
      return null;
    }

    return fetchNextPage();
  }, 300);

  const renderSuggestions = () => {
    if (!data) {
      return null;
    }

    return (
      <div className='flex flex-col sm:pb-10 sm:pt-4'>
        <ScrollableList
          isLoading={isFetching}
          scrollKey='suggestions'
          onLoadMore={handleLoadMore}
          hasMore={hasNextPage}
          useWindowScroll={false}
          style={{ height: 320 }}
        >
          {data.map((suggestion) => (
            <div key={suggestion.account.id} className='py-2'>
              <AccountContainer
                id={suggestion.account.id}
                showProfileHoverCard={false}
                withLinkToProfile={false}
              />
            </div>
          ))}
        </ScrollableList>
      </div>
    );
  };

  const renderEmpty = () => {
    return (
      <div className='my-2 rounded-lg bg-primary-50 p-8 text-center dark:bg-gray-800'>
        <Text>
          <FormattedMessage id='empty_column.follow_recommendations' defaultMessage='Looks like no suggestions could be generated for you. You can try using search to look for people you might know or explore trending hashtags.' />
        </Text>
      </div>
    );
  };

  const renderBody = () => {
    if (!data || data.length === 0) {
      return renderEmpty();
    } else {
      return renderSuggestions();
    }
  };

  return (
    <BigCard
      title={<FormattedMessage id='onboarding.suggestions.title' defaultMessage='Suggested accounts' />}
      subtitle={<FormattedMessage id='onboarding.suggestions.subtitle' defaultMessage='Here are a few of the most popular accounts you might like.' />}
    >
      {renderBody()}

      <Stack>
        <Stack justifyContent='center' space={2}>
          <Button
            block
            theme='primary'
            onClick={onNext}
          >
            <FormattedMessage id='onboarding.done' defaultMessage='Done' />
          </Button>

          <Button block theme='tertiary' type='button' onClick={onNext}>
            <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
          </Button>
        </Stack>
      </Stack>
    </BigCard>
  );
};

export default SuggestedAccountsStep;
