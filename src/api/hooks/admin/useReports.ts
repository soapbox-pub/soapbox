import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { type Report, reportSchema } from 'soapbox/schemas';

const useReports = () => {
  const api = useApi();
  const features = useFeatures();

  const { entities: reports, ...result } = useEntities<Report>(
    [Entities.GROUPS, 'popular'],
    () => api.get('/api/v1/admin/reports'),
    {
      schema: reportSchema,
      enabled: features.groupsDiscovery,
    },
  );

  return {
    ...result,
    reports,
  };
};

export { reports };
