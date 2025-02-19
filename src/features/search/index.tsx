import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui/column.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SearchResults from 'soapbox/features/compose/components/search-results.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';
import ExplorerCards from 'soapbox/features/search/components/explorer-cards.tsx';
import ExplorerFilter from 'soapbox/features/search/components/explorerFilter.tsx';
import AccountsCarousel from 'soapbox/features/search/components/people-to-follow-card.tsx';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Explorer' },
});

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)} slim>

      <Stack space={4}>
        <ExplorerCards />

        <Divider text='Filters' />

        <ExplorerFilter />

        <Divider />

        <AccountsCarousel />

        <Divider />

        <div className='px-4'>
          <Search autoSubmit />
        </div>

        <SearchResults />
      </Stack>
    </Column>
  );
};

export default SearchPage;
