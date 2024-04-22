import { useEffect } from 'react';

import { importStatuses } from 'soapbox/actions/importer';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useAppDispatch, useFeatures } from 'soapbox/hooks';
import { type Report, reportSchema, accountSchema } from 'soapbox/schemas';
import { filteredArray } from 'soapbox/schemas/utils';

const useReports = ({ resolved, enabled = true }: { resolved?: boolean; enabled?: boolean } = {}) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { openReportsCount, setOpenReportsCount } = useStatContext();

  const { entities: reports, ...result } = useEntities<Report>(
    [Entities.REPORTS, resolved === false ? 'open' : resolved ? 'resolved' : 'all'],
    () => features.mastodonAdmin
      ? api.get('/api/v1/admin/reports', { params: { resolved } })
      : api.get('/api/v1/pleroma/admin/reports', { params: { state: resolved === false ? 'open' : (resolved ? 'resolved' : null) } }),
    {
      enabled,
      schema: reportSchema.transform((report) => {
        const accounts = filteredArray(accountSchema).parse([
          report.account.account,
          report.action_taken_by_account?.account || undefined,
          report.assigned_account?.account || undefined,
          report.target_account.account,
        ]);

        dispatch(importEntities(accounts, Entities.ACCOUNTS));
        dispatch(importStatuses(report.statuses));

        return report;
      }),
    },
  );

  useEffect(() => {
    if (resolved === false && reports.length !== openReportsCount) setOpenReportsCount(reports.length);
  }, [resolved, reports.length]);

  return {
    ...result,
    reports,
  };
};

export { useReports };
