import { pin as pinAction, unpin as unpinAction, togglePin as togglePinAction } from 'soapbox/actions/interactions.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function usePin() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const pin = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(pinAction(status));
    }
  };

  const unpin = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(unpinAction(status));
    }
  };

  const togglePin = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(togglePinAction(status));
    }
  };

  return { pin, unpin, togglePin };
}
