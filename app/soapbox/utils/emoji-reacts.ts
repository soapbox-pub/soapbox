import {
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable';

import type { Me } from 'soapbox/types/soapbox';

// https://emojipedia.org/facebook
// I've customized them.
export const ALLOWED_EMOJI = ImmutableList([
  '👍',
  '❤️',
  '😆',
  '😮',
  '😢',
  '😩',
]);

type Account = ImmutableMap<string, any>;
type EmojiReact = ImmutableMap<string, any>;

export const sortEmoji = (emojiReacts: ImmutableList<EmojiReact>, allowedEmoji: ImmutableList<string>): ImmutableList<EmojiReact> => (
  emojiReacts
    .sortBy(emojiReact =>
      -(emojiReact.get('count') + Number(allowedEmoji.includes(emojiReact.get('name')))))
);

export const mergeEmojiFavourites = (emojiReacts = ImmutableList<EmojiReact>(), favouritesCount: number, favourited: boolean) => {
  if (!favouritesCount) return emojiReacts;
  const likeIndex = emojiReacts.findIndex(emojiReact => emojiReact.get('name') === '👍');
  if (likeIndex > -1) {
    const likeCount = Number(emojiReacts.getIn([likeIndex, 'count']));
    favourited = favourited || Boolean(emojiReacts.getIn([likeIndex, 'me'], false));
    return emojiReacts
      .setIn([likeIndex, 'count'], likeCount + favouritesCount)
      .setIn([likeIndex, 'me'], favourited);
  } else {
    return emojiReacts.push(ImmutableMap({ count: favouritesCount, me: favourited, name: '👍' }));
  }
};

const hasMultiReactions = (emojiReacts: ImmutableList<EmojiReact>, account: Account): boolean => (
  emojiReacts.filter(
    e => e.get('accounts').filter(
      (a: Account) => a.get('id') === account.get('id'),
    ).count() > 0,
  ).count() > 1
);

const inAccounts = (accounts: ImmutableList<Account>, id: string): boolean => (
  accounts.filter(a => a.get('id') === id).count() > 0
);

export const oneEmojiPerAccount = (emojiReacts: ImmutableList<EmojiReact>, me: Me) => {
  emojiReacts = emojiReacts.reverse();

  return emojiReacts.reduce((acc, cur, idx) => {
    const accounts = cur.get('accounts', ImmutableList())
      .filter((a: Account) => !hasMultiReactions(acc, a));

    return acc.set(idx, cur.merge({
      accounts: accounts,
      count: accounts.count(),
      me: me ? inAccounts(accounts, me) : false,
    }));
  }, emojiReacts)
    .filter(e => e.get('count') > 0)
    .reverse();
};

export const reduceEmoji = (emojiReacts: ImmutableList<EmojiReact>, favouritesCount: number, favourited: boolean, allowedEmoji = ALLOWED_EMOJI): ImmutableList<EmojiReact> => (
  sortEmoji(
    mergeEmojiFavourites(emojiReacts, favouritesCount, favourited),
    allowedEmoji,
  ));

export const getReactForStatus = (status: any, allowedEmoji = ALLOWED_EMOJI): EmojiReact | undefined => {
  const result = reduceEmoji(
    status.pleroma.get('emoji_reactions', ImmutableList()),
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).filter(e => e.get('me') === true)
    .get(0);

  return typeof result?.get('name') === 'string' ? result : undefined;
};

export const simulateEmojiReact = (emojiReacts: ImmutableList<EmojiReact>, emoji: string, url?: string) => {
  const idx = emojiReacts.findIndex(e => e.get('name') === emoji);
  const emojiReact = emojiReacts.get(idx);

  if (idx > -1 && emojiReact) {
    return emojiReacts.set(idx, emojiReact.merge({
      count: emojiReact.get('count') + 1,
      me: true,
      url,
    }));
  } else {
    return emojiReacts.push(ImmutableMap({
      count: 1,
      me: true,
      name: emoji,
      url,
    }));
  }
};

export const simulateUnEmojiReact = (emojiReacts: ImmutableList<EmojiReact>, emoji: string) => {
  const idx = emojiReacts.findIndex(e =>
    e.get('name') === emoji && e.get('me') === true);

  const emojiReact = emojiReacts.get(idx);

  if (emojiReact) {
    const newCount = emojiReact.get('count') - 1;
    if (newCount < 1) return emojiReacts.delete(idx);
    return emojiReacts.set(idx, emojiReact.merge({
      count: emojiReact.get('count') - 1,
      me: false,
    }));
  } else {
    return emojiReacts;
  }
};
