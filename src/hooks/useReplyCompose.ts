import { replyCompose as replyComposeAction } from 'soapbox/actions/compose.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { selectEntity } from 'soapbox/entity-store/selectors.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';
import { normalizeStatus } from 'soapbox/normalizers/index.ts';
import { Status as StatusEntity } from 'soapbox/schemas/index.ts';

import type { Status as LegacyStatus } from 'soapbox/types/entities.ts';

export function useReplyCompose() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const replyCompose = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(replyComposeAction(status));
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(replyComposeAction(normalizeStatus(status) as LegacyStatus));
    }
  };

  return { replyCompose };
}