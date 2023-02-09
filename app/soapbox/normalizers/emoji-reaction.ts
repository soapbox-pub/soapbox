import { Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

// https://docs.joinmastodon.org/entities/emoji/
export const EmojiReactionRecord = ImmutableRecord({
  name: '',
  count: null as number | null,
  me: false,
});

export const normalizeEmojiReaction = (emojiReaction: Record<string, any>) => {
  return EmojiReactionRecord(
    ImmutableMap(fromJS(emojiReaction)),
  );
};
