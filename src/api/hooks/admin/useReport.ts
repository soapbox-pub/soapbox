import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { type Report, reportSchema } from 'soapbox/schemas';

const useReport = (reportId: string) => {
  const api = useApi();
  const features = useFeatures();

  const { entity: report, ...result } = useEntity<Report>(
    [Entities.REPORTS, reportId],
    () => features.mastodonAdmin
      ? api.get(`/api/v1/admin/report${reportId}`)
      : api.get(`/api/v1/pleroma/admin/reports/${reportId}`),
    {
      schema: reportSchema,
    },
  );

  return {
    ...result,
    report,
  };
};

export { useReport };
