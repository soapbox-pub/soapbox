import debounce from 'lodash/debounce';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Stack, Text } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { HeaderSteps } from 'soapbox/features/ui/components/modals/onboarding-flow-modal/header-steps';
import { useOnboardingSuggestions } from 'soapbox/queries/suggestions';

interface ICoverPhotoSelectionModal {
  onClose?(): void;
  onNext: () => void;
}

const CoverPhotoSelectionModal: React.FC<ICoverPhotoSelectionModal> = ({ onClose, onNext }) => {
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
      <div className='flex flex-col sm:pb-4 sm:pt-0'>
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

    <Stack space={2} justifyContent='center' alignItems='center' className='relative w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black sm:p-10 dark:bg-primary-900 dark:text-gray-100 dark:shadow-none'>

      <HeaderSteps onClose={onClose} title={<FormattedMessage id='onboarding.suggestions.title' defaultMessage='Suggested accounts' />} subtitle={<FormattedMessage id='onboarding.suggestions.subtitle' defaultMessage='Here are a few of the most popular accounts you might like.' />} />

      <Stack justifyContent='center' alignItems='center' className='w-full gap-5 sm:gap-0'>
        <div className='w-full sm:w-2/3'>
          {renderBody()}
        </div>

        <Stack justifyContent='center' space={2} className='w-full sm:w-2/3'>
          <Button block theme='primary' type='button' onClick={onNext}>
            <FormattedMessage id='onboarding.done' defaultMessage='Done' />
          </Button>

          <Button block theme='tertiary' type='button' onClick={onNext}>
            <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};


export default CoverPhotoSelectionModal;