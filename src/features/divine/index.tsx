import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSearch, submitSearch } from '@/actions/search.ts';
import { Column } from '@/components/ui/column.tsx';
import Stack from '@/components/ui/stack.tsx';
import SearchResults from '@/features/compose/components/search-results.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

const messages = defineMessages({
  heading: { id: 'column.divine', defaultMessage: 'diVine' },
});

const DivinePage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  // Set up the video filter when component mounts
  useEffect(() => {
    // Set the search value to "video:true"
    dispatch(changeSearch('video:true'));
    // Submit the search
    dispatch(submitSearch('statuses', 'video:true'));

    // Cleanup: clear the search when leaving the page
    return () => {
      dispatch(changeSearch(''));
    };
  }, [dispatch]);

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader>
      <Stack space={4}>
        <SearchResults />
      </Stack>
    </Column>
  );
};

export default DivinePage;
