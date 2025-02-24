import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui/column.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SearchResults from 'soapbox/features/compose/components/search-results.tsx';
import ExplorerCards from 'soapbox/features/explorer/components/explorer-cards.tsx';
import ExplorerFilter from 'soapbox/features/explorer/components/explorerFilter.tsx';
import AccountsCarousel from 'soapbox/features/explorer/components/popular-accounts.tsx';

const messages = defineMessages({
  heading: { id: 'column.explorer', defaultMessage: 'Explorer' },
});

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} slim>

      <Stack space={4}>
        <ExplorerCards />

        <Divider text='Filters' />

        <ExplorerFilter />

        <Divider />

        <AccountsCarousel />

        <Divider />

        <SearchResults />

      </Stack>
    </Column>
  );
};

export default SearchPage;
