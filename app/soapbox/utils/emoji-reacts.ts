import type { EmojiReaction, Status } from 'soapbox/schemas';

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

export const sortEmoji = (
  emojiReacts: readonly EmojiReaction[],
  allowedEmoji: readonly string[],
): readonly EmojiReaction[] => {
  return [...emojiReacts].sort(({ count, name }) => {
    return -((count || 0) + Number(allowedEmoji.includes(name)));
  });
};

/** Return new emoji reactions, where favourites are treated as a thumbs up. */
export const mergeEmojiFavourites = (
  emojiReacts: readonly EmojiReaction[] = [],
  favouritesCount: number,
  favourited: boolean,
  favouriteEmoji = '👍',
) => {
  if (!favouritesCount) return emojiReacts;
  const likeReact = emojiReacts.find(({ name }) => name === favouriteEmoji);

  if (likeReact) {
    return emojiReacts.map((emojiReact) => {
      if (emojiReact.name === favouriteEmoji) {
        return {
          ...emojiReact,
          count: (emojiReact.count || 0) + favouritesCount,
          me: favourited || emojiReact.me,
        };
      } else {
        return emojiReact;
      }
    });
  } else {
    return [...emojiReacts, {
      name: favouriteEmoji,
      count: favouritesCount,
      me: favourited,
    }];
  }
};

export const reduceEmoji = (
  emojiReacts: readonly EmojiReaction[],
  favouritesCount: number,
  favourited: boolean,
  allowedEmoji = ALLOWED_EMOJI,
): readonly EmojiReaction[] => {
  return sortEmoji(
    mergeEmojiFavourites(emojiReacts, favouritesCount, favourited),
    allowedEmoji,
  );
};

export const getReactForStatus = (
  status: Status,
  allowedEmoji = ALLOWED_EMOJI,
): EmojiReaction | undefined => {
  return reduceEmoji(
    status.pleroma?.emoji_reactions || [],
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).find(({ me }) => me);
};

export const simulateEmojiReact = (
  emojiReacts: readonly EmojiReaction[],
  emoji: string,
  url?: string,
): EmojiReaction[] => {
  const emojiReact = emojiReacts.find(({ name }) => name === emoji);

  if (emojiReact) {
    return emojiReacts.map((emojiReact) => {
      if (emojiReact.name === emoji) {
        return {
          ...emojiReact,
          count: (emojiReact.count || 0) + 1,
          me: true,
          url,
        };
      } else {
        return emojiReact;
      }
    });
  } else {
    return [...emojiReacts, {
      count: 1,
      me: true,
      name: emoji,
      url,
    }];
  }
};

export const simulateUnEmojiReact = (
  emojiReacts: readonly EmojiReaction[],
  emoji: string,
): readonly EmojiReaction[] => {
  const emojiReact = emojiReacts.find(({ name, me }) => name === emoji && me);

  if (emojiReact) {
    const newCount = (emojiReact.count || 0) - 1;
    if (newCount < 1) {
      return emojiReacts.filter(({ name }) => name !== emoji);
    }

    return emojiReacts.map((emojiReact) => {
      if (emojiReact.name === emoji) {
        return {
          ...emojiReact,
          count: newCount,
          me: false,
        };
      } else {
        return emojiReact;
      }
    });
  } else {
    return emojiReacts;
  }
};
