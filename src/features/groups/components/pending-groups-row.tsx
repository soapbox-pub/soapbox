import { usePendingGroups } from '@/api/hooks/index.ts';
import { PendingItemsRow } from '@/components/pending-items-row.tsx';
import Divider from '@/components/ui/divider.tsx';
import { useFeatures } from '@/hooks/useFeatures.ts';

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