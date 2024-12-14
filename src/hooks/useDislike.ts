import { dislike as dislikeAction, undislike as undislikeAction, toggleDislike as toggleDislikeAction } from 'soapbox/actions/interactions.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function useDislike() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const dislike = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(dislikeAction(status));
    }
  };

  const undislike = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(undislikeAction(status));
    }
  };

  const toggleDislike = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(toggleDislikeAction(status));
    }
  };

  return { dislike, undislike, toggleDislike };
}
