import { replyCompose as replyComposeAction } from 'soapbox/actions/compose.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

export function useReplyCompose() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const replyCompose = (statusId: string) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      dispatch(replyComposeAction(status));
    }
  };

  return { replyCompose };
}