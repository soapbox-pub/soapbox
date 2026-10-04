import { EmojiReaction, emojiReactionSchema } from '@/schemas/index.ts';

// https://emojipedia.org/facebook
// I've customized them.
export const ALLOWED_EMOJI: readonly string[] = [
  '👍',
  '❤️',
  '😆',
  '😮',
  '😢',
  '😩',
];

export const sortEmoji = (emojiReacts: readonly EmojiReaction[], allowedEmoji: readonly string[]): EmojiReaction[] => {
  const score = (emojiReact: EmojiReaction) => -((emojiReact.count || 0) + Number(allowedEmoji.includes(emojiReact.name)));
  return [...emojiReacts].sort((a, b) => score(a) - score(b));
};

export const mergeEmojiFavourites = (emojiReacts: readonly EmojiReaction[] | null, favouritesCount: number, favourited: boolean): EmojiReaction[] => {
  if (!emojiReacts) return [emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: '👍' })];
  if (!favouritesCount) return [...emojiReacts];
  const likeIndex = emojiReacts.findIndex(emojiReact => emojiReact.name === '👍');
  if (likeIndex > -1) {
    const like = emojiReacts[likeIndex];
    const likeCount = Number(like.count);
    favourited = favourited || Boolean(like.me);
    return emojiReacts.map((emojiReact, i) => i === likeIndex
      ? { ...emojiReact, count: likeCount + favouritesCount, me: favourited }
      : emojiReact,
    );
  } else {
    return [...emojiReacts, emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: '👍' })];
  }
};

export const reduceEmoji = (emojiReacts: readonly EmojiReaction[] | null, favouritesCount: number, favourited: boolean, allowedEmoji = ALLOWED_EMOJI): EmojiReaction[] => (
  sortEmoji(
    mergeEmojiFavourites(emojiReacts, favouritesCount, favourited),
    allowedEmoji,
  ));

export const getReactForStatus = (status: any, allowedEmoji = ALLOWED_EMOJI): EmojiReaction | undefined => {
  if (!status.reactions) return;

  const result = reduceEmoji(
    status.reactions,
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).find(e => e.me === true);

  return typeof result?.name === 'string' ? result : undefined;
};

export const simulateEmojiReact = (emojiReacts: readonly EmojiReaction[], emoji: string, url?: string): EmojiReaction[] => {
  const idx = emojiReacts.findIndex(e => e.name === emoji);
  const emojiReact = emojiReacts[idx];

  if (idx > -1 && emojiReact) {
    return emojiReacts.map((e, i) => i === idx ? emojiReactionSchema.parse({
      ...emojiReact,
      count: (emojiReact.count || 0) + 1,
      me: true,
      url,
    }) : e);
  } else {
    return [...emojiReacts, emojiReactionSchema.parse({
      count: 1,
      me: true,
      name: emoji,
      url,
    })];
  }
};

export const simulateUnEmojiReact = (emojiReacts: readonly EmojiReaction[], emoji: string): EmojiReaction[] => {
  const idx = emojiReacts.findIndex(e =>
    e.name === emoji && e.me === true);

  const emojiReact = emojiReacts[idx];

  if (emojiReact) {
    const newCount = (emojiReact.count || 1) - 1;
    if (newCount < 1) return emojiReacts.filter((_, i) => i !== idx);
    return emojiReacts.map((e, i) => i === idx ? emojiReactionSchema.parse({
      ...emojiReact,
      count: (emojiReact.count || 1) - 1,
      me: false,
    }) : e);
  } else {
    return [...emojiReacts];
  }
};
