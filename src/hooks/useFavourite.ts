import { favourite as favouriteAction, unfavourite as unfavouriteAction, toggleFavourite as toggleFavouriteAction } from 'soapbox/actions/interactions.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function useFavourite() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const favourite = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(favouriteAction(status));
    }
  };

  const unfavourite = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(unfavouriteAction(status));
    }
  };

  const toggleFavourite = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(toggleFavouriteAction(status));
    }
  };

  return { favourite, unfavourite, toggleFavourite };
}
