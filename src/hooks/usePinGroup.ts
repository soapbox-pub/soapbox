import { pinToGroup as pinToGroupAction, unpinFromGroup as unpinFromGroupAction } from '@/actions/interactions.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';

export function usePinGroup() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const pinToGroup = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status && status.group) {
      return dispatch(pinToGroupAction(status, status.group));
    }
  };

  const unpinFromGroup = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status && status.group) {
      return dispatch(unpinFromGroupAction(status, status.group));
    }
  };

  return { pinToGroup, unpinFromGroup };
}
