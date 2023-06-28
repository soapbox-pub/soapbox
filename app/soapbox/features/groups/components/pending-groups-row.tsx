import React from 'react';

import { usePendingGroups } from 'soapbox/api/hooks';
import { PendingItemsRow } from 'soapbox/components/pending-items-row';
import { Divider } from 'soapbox/components/ui';
import { useFeatures } from 'soapbox/hooks';

export default () => {
  const features = useFeatures();

  const { groups, isFetching } = usePendingGroups();

  if (!features.groupsPending || isFetching || groups.length === 0) {
    return null;
  }

  return (
    <>
      <PendingItemsRow
        to='/groups/pending-requests'
        count={groups.length}
        size='lg'
      />

      <Divider />
    </>
  );
};