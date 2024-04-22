import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { reportSchema } from 'soapbox/schemas';

const useCloseReport = (reportId: string) => {
  const api = useApi();
  const features = useFeatures();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.REPORTS],
    () => features.mastodonAdmin
      ? api.post(`/api/v1/admin/reports/${reportId}/resolve`)
      : api.patch('/api/v1/pleroma/admin/reports'),
    { schema: reportSchema },
  );

  return {
    closeReport: createEntity,
    isSubmitting,
  };
};

export { useCloseReport };
