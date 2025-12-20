import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSearch, submitSearch } from '@/actions/search.ts';
import { Column } from '@/components/ui/column.tsx';
import Stack from '@/components/ui/stack.tsx';
import SearchResults from '@/features/compose/components/search-results.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';

const messages = defineMessages({
  heading: { id: 'column.divine', defaultMessage: 'Vines' },
});

const DivinePage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  // Set up the video filter when component mounts
  useEffect(() => {
    // Set the search value to "video:true"
    dispatch(changeSearch('video:true'));
    // Submit the search with short_videos_only=true only if backend is Ditto (features.nostr)
    dispatch(submitSearch('statuses', 'video:true', features.nostr));

    // Cleanup: clear the search when leaving the page
    return () => {
      dispatch(changeSearch(''));
    };
  }, [dispatch, features.nostr]);

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader>
      <Stack space={4}>
        <SearchResults />
      </Stack>
    </Column>
  );
};

export default DivinePage;
