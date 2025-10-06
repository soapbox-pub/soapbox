import { dislike as dislikeAction, undislike as undislikeAction, toggleDislike as toggleDislikeAction } from '@/actions/interactions.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';

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
