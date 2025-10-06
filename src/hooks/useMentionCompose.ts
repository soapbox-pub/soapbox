import { mentionCompose as mentionComposeAction } from '@/actions/compose.ts';
import { EntityTypes, Entities } from '@/entity-store/entities.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

export function useMentionCompose() {
  const dispatch = useAppDispatch();

  const mentionCompose = (account: EntityTypes[Entities.ACCOUNTS]) => {
    dispatch(mentionComposeAction(account));
  };

  return { mentionCompose };
}