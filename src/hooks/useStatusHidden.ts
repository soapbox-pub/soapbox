import { revealStatus as revealStatusAction, hideStatus as hideStatusAction, toggleStatusHidden as toggleStatusHiddenAction } from 'soapbox/actions/statuses.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function useStatusHidden() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const revealStatus = (statusId: string) => {
    dispatch(revealStatusAction(statusId));
  };

  const hideStatus = (statusId: string) => {
    dispatch(hideStatusAction(statusId));
  };

  const toggleStatusHidden = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(toggleStatusHiddenAction(status));
    }
  };

  return { revealStatus, hideStatus, toggleStatusHidden };
}
