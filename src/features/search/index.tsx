import clsx from 'clsx';
import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui/column.tsx';
import SearchResults from 'soapbox/features/compose/components/search-results.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';
import { useTheme } from 'soapbox/hooks/useTheme.ts';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Discover' },
});

const SearchPage = () => {
  const intl = useIntl();

  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      className={clsx({ '!px-0': isMobile || theme === 'black' })}
    >
      <div className='space-y-4'>
        <div className='px-4 sm:py-0'>
          <Search autoFocus autoSubmit />
        </div>
        <SearchResults />
      </div>
    </Column>
  );
};

export default SearchPage;
