import { quoteCompose as quoteComposeAction } from 'soapbox/actions/compose.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function useQuoteCompose() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const quoteCompose = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(quoteComposeAction(status));
    }
  };

  return { quoteCompose };
}