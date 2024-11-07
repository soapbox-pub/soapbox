import debounce from 'lodash/debounce';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, Stack, Text } from 'soapbox/components/ui';
import IconButton from 'soapbox/components/ui/icon-button/icon-button';
import AccountContainer from 'soapbox/containers/account-container';
import { useOnboardingSuggestions } from 'soapbox/queries/suggestions';

const closeIcon = require('@tabler/icons/outline/x.svg');

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

    <Stack space={2} justifyContent='center' alignItems='center' className='relative w-full rounded-3xl bg-white px-4 py-8 text-gray-900 shadow-lg black:bg-black dark:bg-primary-900 dark:text-gray-100 dark:shadow-none sm:p-10'>

      <div className='relative w-full'>
        <IconButton src={closeIcon} onClick={onClose} className='absolute -right-2 -top-6 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' />
        <Stack space={2} justifyContent='center' alignItems='center' className='-mx-4 mb-4 border-b border-solid pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Text size='2xl' align='center' weight='bold'>
            <FormattedMessage id='onboarding.suggestions.title' defaultMessage='Suggested accounts' />
          </Text>
          <Text theme='muted' align='center'>
            <FormattedMessage id='onboarding.suggestions.subtitle' defaultMessage='Here are a few of the most popular accounts you might like.' />
          </Text>
        </Stack>
      </div>

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