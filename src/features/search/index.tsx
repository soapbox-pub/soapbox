import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui/column.tsx';
import SearchResults from 'soapbox/features/compose/components/search-results.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Discover' },
});

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      className='!px-0'
    >
      <div className='space-y-4'>
        <div className='px-4 sm:py-0'>
          <Search autoSubmit />
        </div>
        <SearchResults />
      </div>
    </Column>
  );
};

export default SearchPage;
