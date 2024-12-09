import { reblog as reblogAction, unreblog as unreblogAction, toggleReblog as toggleReblogAction } from 'soapbox/actions/interactions.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function useReblog() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const reblog = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(reblogAction(status));
    }
  };

  const unreblog = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(unreblogAction(status));
    }
  };

  const toggleReblog = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(toggleReblogAction(status));
    }
  };

  return { reblog, unreblog, toggleReblog };
}
