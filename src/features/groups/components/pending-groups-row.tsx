import { usePendingGroups } from 'soapbox/api/hooks/index.ts';
import { PendingItemsRow } from 'soapbox/components/pending-items-row.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';

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