import { quoteCompose as quoteComposeAction } from '@/actions/compose.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';

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