import { statusSchema } from 'soapbox/schemas';

import {
  sortEmoji,
  mergeEmojiFavourites,
  reduceEmoji,
  getReactForStatus,
  simulateEmojiReact,
  simulateUnEmojiReact,
} from '../emoji-reacts';

const ALLOWED_EMOJI = [
  '👍',
  '❤',
  '😂',
  '😯',
  '😢',
  '😡',
];

describe('sortEmoji', () => {
  describe('with an unsorted list of emoji', () => {
    const emojiReacts = [
      { 'count': 7,  'me': true, 'name': '😃' },
      { 'count': 7,  'me': true, 'name': '😯' },
      { 'count': 3,  'me': true, 'name': '😢' },
      { 'count': 1,  'me': true, 'name': '😡' },
      { 'count': 20, 'me': true, 'name': '👍' },
      { 'count': 7,  'me': true, 'name': '😂' },
      { 'count': 15, 'me': true, 'name': '❤' },
    ];
    it('sorts the emoji by count', () => {
      expect(sortEmoji(emojiReacts, ALLOWED_EMOJI)).toEqual([
        { 'count': 20, 'me': true, 'name': '👍' },
        { 'count': 15, 'me': true, 'name': '❤' },
        { 'count': 7,  'me': true, 'name': '😯' },
        { 'count': 7,  'me': true, 'name': '😂' },
        { 'count': 7,  'me': true, 'name': '😃' },
        { 'count': 3,  'me': true, 'name': '😢' },
        { 'count': 1,  'me': true, 'name': '😡' },
      ]);
    });
  });
});

describe('mergeEmojiFavourites', () => {
  const favouritesCount = 12;
  const favourited = true;

  describe('with existing 👍 reacts', () => {
    const emojiReacts = [
      { 'count': 20, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 15, 'me': false, 'name': '❤', 'url': undefined },
      { 'count': 7,  'me': false, 'name': '😯', 'url': undefined },
    ];
    it('combines 👍 reacts with favourites', () => {
      expect(mergeEmojiFavourites(emojiReacts, favouritesCount, favourited)).toEqual([
        { 'count': 32, 'me': true,  'name': '👍', 'url': undefined },
        { 'count': 15, 'me': false, 'name': '❤', 'url': undefined },
        { 'count': 7,  'me': false, 'name': '😯', 'url': undefined },
      ]);
    });
  });

  describe('without existing 👍 reacts', () => {
    const emojiReacts = [
      { 'count': 15, 'me': false, 'name': '❤' },
      { 'count': 7,  'me': false, 'name': '😯' },
    ];
    it('adds 👍 reacts to the map equaling favourite count', () => {
      expect(mergeEmojiFavourites(emojiReacts, favouritesCount, favourited)).toEqual([
        { 'count': 15, 'me': false, 'name': '❤' },
        { 'count': 7,  'me': false, 'name': '😯' },
        { 'count': 12, 'me': true,  'name': '👍' },
      ]);
    });
    it('does not add 👍 reacts when there are no favourites', () => {
      expect(mergeEmojiFavourites(emojiReacts, 0, false)).toEqual([
        { 'count': 15, 'me': false,  'name': '❤' },
        { 'count': 7,  'me': false,  'name': '😯' },
      ]);
    });
  });
});

describe('reduceEmoji', () => {
  describe('with a clusterfuck of emoji', () => {
    const emojiReacts = [
      { 'count': 1,  'me': false, 'name': '😡' },
      { 'count': 1,  'me': true,  'name': '🔪' },
      { 'count': 7,  'me': true,  'name': '😯' },
      { 'count': 3,  'me': false, 'name': '😢' },
      { 'count': 1,  'me': true,  'name': '🌵' },
      { 'count': 20, 'me': true,  'name': '👍' },
      { 'count': 7,  'me': false, 'name': '😂' },
      { 'count': 15, 'me': true,  'name': '❤' },
      { 'count': 1,  'me': false, 'name': '👀' },
      { 'count': 1,  'me': false, 'name': '🍩' },
    ];
    it('sorts, filters, and combines emoji and favourites', () => {
      expect(reduceEmoji(emojiReacts, 7, true, ALLOWED_EMOJI)).toEqual([
        { 'count': 27, 'me': true,  'name': '👍' },
        { 'count': 15, 'me': true,  'name': '❤' },
        { 'count': 7,  'me': true,  'name': '😯' },
        { 'count': 7,  'me': false, 'name': '😂' },
        { 'count': 3,  'me': false, 'name': '😢' },
        { 'count': 1,  'me': false, 'name': '😡' },
        { 'count': 1,  'me': true,  'name': '🔪' },
        { 'count': 1,  'me': true,  'name': '🌵' },
        { 'count': 1,  'me': false, 'name': '👀' },
        { 'count': 1,  'me': false, 'name': '🍩' },
      ]);
    });
  });
});

describe('getReactForStatus', () => {
  it('returns a single owned react (including favourite) for the status', () => {
    const status = statusSchema.parse({
      id: '1',
      favourited: false,
      pleroma: {
        emoji_reactions: [
          { 'count': 20, 'me': false, 'name': '👍' },
          { 'count': 15, 'me': true,  'name': '❤' },
          { 'count': 7,  'me': true,  'name': '😯' },
          { 'count': 7,  'me': false, 'name': '😂' },
        ],
      },
    });
    expect(getReactForStatus(status, ALLOWED_EMOJI)?.name).toEqual('❤');
  });

  it('returns a thumbs-up for a favourite', () => {
    const status = statusSchema.parse({ id: '1', favourites_count: 1, favourited: true });
    expect(getReactForStatus(status)?.name).toEqual('👍');
  });

  it('returns undefined when a status has no reacts (or favourites)', () => {
    const status = statusSchema.parse({ id: '1' });
    expect(getReactForStatus(status)).toEqual(undefined);
  });

  it('returns undefined when a status has no valid reacts (or favourites)', () => {
    const status = statusSchema.parse({
      id: '1',
      pleroma: {
        emoji_reactions: [
          { 'count': 1,  'me': true,  'name': '🔪' },
          { 'count': 1,  'me': true,  'name': '🌵' },
          { 'count': 1,  'me': false, 'name': '👀' },
          { 'count': 1,  'me': false, 'name': '🍩' },
        ],
      },
    });
    expect(getReactForStatus(status)).toEqual(undefined);
  });
});

describe('simulateEmojiReact', () => {
  it('adds the emoji to the list', () => {
    const emojiReacts = [
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
    ];
    expect(simulateEmojiReact(emojiReacts, '❤')).toEqual([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 3, 'me': true,  'name': '❤', 'url': undefined },
    ]);
  });

  it('creates the emoji if it didn\'t already exist', () => {
    const emojiReacts = [
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
    ];
    expect(simulateEmojiReact(emojiReacts, '😯')).toEqual([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
      { 'count': 1, 'me': true,  'name': '😯', 'url': undefined },
    ]);
  });

  it('adds a custom emoji to the list', () => {
    const emojiReacts = [
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
    ];
    expect(simulateEmojiReact(emojiReacts, 'soapbox', 'https://gleasonator.com/emoji/Gleasonator/soapbox.png')).toEqual([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false,  'name': '❤', 'url': undefined },
      { 'count': 1, 'me': true,  'name': 'soapbox', 'url': 'https://gleasonator.com/emoji/Gleasonator/soapbox.png' },
    ]);
  });
});

describe('simulateUnEmojiReact', () => {
  it('removes the emoji from the list', () => {
    const emojiReacts = [
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 3, 'me': true, 'name': '❤' },
    ];
    expect(simulateUnEmojiReact(emojiReacts, '❤')).toEqual([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false,  'name': '❤' },
    ]);
  });

  it('removes the emoji if it\'s the last one in the list', () => {
    const emojiReacts = [
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
      { 'count': 1, 'me': true,  'name': '😯' },
    ];
    expect(simulateUnEmojiReact(emojiReacts, '😯')).toEqual([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
    ]);
  });

  it ('removes custom emoji from the list', () => {
    const emojiReacts = [
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
      { 'count': 1, 'me': true,  'name': 'soapbox', 'url': 'https://gleasonator.com/emoji/Gleasonator/soapbox.png' },
    ];
    expect(simulateUnEmojiReact(emojiReacts, 'soapbox')).toEqual([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
    ]);
  });
});
