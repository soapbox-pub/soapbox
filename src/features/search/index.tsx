import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SearchResults from 'soapbox/features/compose/components/search-results.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Discover' },
});

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)} slim>
      <Stack space={4}>
        <div className='px-4'>
          <Search autoSubmit />
        </div>
        <SearchResults />
      </Stack>
    </Column>
  );
};

export default SearchPage;
