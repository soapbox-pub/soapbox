import { reblog as reblogAction, unreblog as unreblogAction, toggleReblog as toggleReblogAction } from 'soapbox/actions/interactions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { useTransaction } from 'soapbox/entity-store/hooks/index.ts';
import { selectEntity } from 'soapbox/entity-store/selectors.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';
import { normalizeStatus } from 'soapbox/normalizers/index.ts';
import { Status as StatusEntity } from 'soapbox/schemas/index.ts';

import type { Status as LegacyStatus } from 'soapbox/types/entities.ts';

export function useReblog() {
  const getState = useGetState();
  const dispatch = useAppDispatch();
  const { transaction } = useTransaction();

  function reblogEffect(statusId: string) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          reblogged: true,
          reblogs_count: status.reblogs_count + 1,
        }),
      },
    });
  }

  function unreblogEffect(statusId: string) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          reblogged: false,
          reblogs_count: status.reblogs_count - 1,
        }),
      },
    });
  }

  const reblog = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(reblogAction(status, { reblogEffect, unreblogEffect }));
      return;
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(reblogAction(normalizeStatus(status) as LegacyStatus, { reblogEffect, unreblogEffect }));
      return;
    }
  };

  const unreblog = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(unreblogAction(status, { reblogEffect, unreblogEffect }));
      return;
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(unreblogAction(normalizeStatus(status) as LegacyStatus, { reblogEffect, unreblogEffect }));
      return;
    }
  };

  const toggleReblog = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(toggleReblogAction(status, { reblogEffect, unreblogEffect }));
      return;
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(toggleReblogAction(normalizeStatus(status) as LegacyStatus, { reblogEffect, unreblogEffect }));
      return;
    }
  };

  return { reblog, unreblog, toggleReblog };
}
