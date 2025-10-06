import { replyCompose as replyComposeAction } from '@/actions/compose.ts';
import { Entities } from '@/entity-store/entities.ts';
import { selectEntity } from '@/entity-store/selectors.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';
import { normalizeStatus } from '@/normalizers/index.ts';
import { Status as StatusEntity } from '@/schemas/index.ts';

import type { Status as LegacyStatus } from '@/types/entities.ts';

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