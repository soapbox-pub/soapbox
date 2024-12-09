import { mentionCompose as mentionComposeAction } from 'soapbox/actions/compose.ts';
import { EntityTypes, Entities } from 'soapbox/entity-store/entities.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

export function useMentionCompose() {
  const dispatch = useAppDispatch();

  const mentionCompose = (account: EntityTypes[Entities.ACCOUNTS]) => {
    dispatch(mentionComposeAction(account));
  };

  return { mentionCompose };
}