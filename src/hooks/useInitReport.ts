import { initReport as initReportAction, ReportableEntities } from '@/actions/reports.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';
import { Account } from '@/schemas/index.ts';

type SemiReportedEntity = {
  statusId?: string;
}

/** TODO: support fully the 'ReportedEntity' type, for now only status is suported. */
export function useInitReport() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const initReport = (entityType: ReportableEntities, account: Account, entities?: SemiReportedEntity) => {
    const { statusId } = entities || {};

    if (!statusId) return;

    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(initReportAction(entityType, account, { status }));
    }
  };

  return { initReport };
}
