import { useFavourite } from 'soapbox/api/hooks/index.ts';
import { importEntities } from 'soapbox/entity-store/actions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { useTransaction } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';
import { EmojiReaction, Status as StatusEntity, statusSchema } from 'soapbox/schemas/index.ts';
import { isLoggedIn } from 'soapbox/utils/auth.ts';

export function useReaction() {
  const api = useApi();
  const getState = useGetState();
  const dispatch = useAppDispatch();
  const { transaction } = useTransaction();
  const { favourite, unfavourite } = useFavourite();

  function emojiReactEffect(statusId: string, emoji: string) {
    transaction({
      Statuses: {
        [statusId]: (status) => {
          // Get the emoji already present in the status reactions, if it exists.
          const currentEmoji = status.reactions.find((value) => value.name === emoji);
          // If the emoji doesn't exist, append it to the array and return.
          if (!currentEmoji) {
            return ({
              ...status,
              reactions: [...status.reactions, { me: true, name: emoji, count: 1 }],
            });
          }
          // if the emoji exists in the status reactions, then just update the array and return.
          return ({
            ...status,
            reactions: status.reactions.map((val) => {
              if (val.name === emoji) {
                return { ...val, me: true, count: (val.count ?? 0) + 1 };
              }
              return val;
            }),
          });
        },
      },
    });
  }

  function unemojiReactEffect(statusId: string, emoji: string) {
    transaction({
      Statuses: {
        [statusId]: (status) => {
          return ({
            ...status,
            reactions: status.reactions.map((val) => {
              if (val.name === emoji && val.me === true) {
                return { ...val, me: false, count: (val.count ?? 1) - 1 };
              }
              return val;
            }),
          });
        },
      },
    });
  }

  const emojiReact = async (status: StatusEntity, emoji: string) => { // TODO: add custom emoji support
    if (!isLoggedIn(getState)) return;
    emojiReactEffect(status.id, emoji);

    try {
      const response = await api.put(`/api/v1/pleroma/statuses/${status.id}/reactions/${emoji}`);
      const result = statusSchema.parse(await response.json());
      if (result) {
        dispatch(importEntities([result], Entities.STATUSES));
      }
    } catch (e) {
      unemojiReactEffect(status.id, emoji);
    }
  };

  const unEmojiReact = async (status: StatusEntity, emoji: string) => {
    if (!isLoggedIn(getState)) return;
    unemojiReactEffect(status.id, emoji);

    try {
      const response = await api.delete(`/api/v1/pleroma/statuses/${status.id}/reactions/${emoji}`);
      const result = statusSchema.parse(await response.json());
      if (result) {
        dispatch(importEntities([result], Entities.STATUSES));
      }
    } catch (e) {
      emojiReactEffect(status.id, emoji);
    }
  };

  const simpleEmojiReact = async (status: StatusEntity, emoji: string) => {
    const emojiReacts: readonly EmojiReaction[] = status.reactions;

    // Undo a standard favourite
    if (emoji === '👍' && status.favourited) return unfavourite(status.id);

    // Undo an emoji reaction
    const undo = emojiReacts.filter(e => e.me === true && e.name === emoji).length > 0;
    if (undo) return unEmojiReact(status, emoji);

    try {
      await Promise.all([
        ...emojiReacts
          .filter((emojiReact) => emojiReact.me === true)
          // Remove all existing emoji reactions by the user before adding a new one. If 'emoji' is an 'apple' and the status already has 'banana' as an emoji, then remove 'banana'
          .map(emojiReact => unEmojiReact(status, emojiReact.name)),
        // Remove existing standard like, if it exists
        status.favourited && unfavourite(status.id),
      ]);

      if (emoji === '👍') {
        favourite(status.id);
      } else {
        emojiReact(status, emoji);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { emojiReact, unEmojiReact, simpleEmojiReact };
}
