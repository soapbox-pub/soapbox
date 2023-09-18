import { List, Map } from 'immutable';
import pick from 'lodash/pick';

import search, { addCustomToPool } from '../search';

const trimEmojis = (emoji: any) => pick(emoji, ['id', 'unified', 'native', 'custom']);

describe('emoji_index', () => {
  it('should give same result for emoji_index_light and emoji-mart', () => {
    const expected = [
      {
        id: 'pineapple',
        unified: '1f34d',
        native: '🍍',
      },
    ];
    expect(search('pineapple').map(trimEmojis)).toEqual(expected);
  });

  it('orders search results correctly', () => {
    const expected = [
      { id: 'apple', unified: '1f34e', native: '🍎' },
      { id: 'pineapple', unified: '1f34d', native: '🍍' },
      { id: 'green_apple', unified: '1f34f', native: '🍏' },
      { id: 'iphone', unified: '1f4f1', native: '📱' },
    ];

    expect(search('apple').map(trimEmojis)).toEqual(expected);
  });

  it('handles custom emojis', () => {
    const custom = [
      {
        id: 'mastodon',
        name: 'mastodon',
        keywords: ['mastodon'],
        skins: { src: 'http://example.com' },
      },
    ];

    const custom_emojis = List([
      Map({ static_url: 'http://example.com', shortcode: 'mastodon' }),
    ]);

    const lightExpected = [
      {
        id: 'mastodon',
        custom: true,
      },
    ];

    addCustomToPool(custom);
    expect(search('masto', {}, custom_emojis).map(trimEmojis)).toEqual(lightExpected);
  });

  it('updates custom emoji if another is passed', () => {
    const custom = [
      {
        id: 'mastodon',
        name: 'mastodon',
        keywords: ['mastodon'],
        skins: { src: 'http://example.com' },
      },
    ];

    addCustomToPool(custom);

    const custom2 = [
      {
        id: 'pleroma',
        name: 'pleroma',
        keywords: ['pleroma'],
        skins: { src: 'http://example.com' },
      },
    ];

    addCustomToPool(custom2);

    const custom_emojis = List([
      Map({ static_url: 'http://example.com', shortcode: 'pleroma' }),
    ]);

    const expected: any = [];
    expect(search('masto', {}, custom_emojis).map(trimEmojis)).toEqual(expected);
  });

  it('does an emoji whose unified name is irregular', () => {
    const expected = [
      {
        'id': 'water_polo',
        'unified': '1f93d',
        'native': '🤽',
      },
      {
        'id': 'man-playing-water-polo',
        'unified': '1f93d-200d-2642-fe0f',
        'native': '🤽‍♂️',
      },
      {
        'id': 'woman-playing-water-polo',
        'unified': '1f93d-200d-2640-fe0f',
        'native': '🤽‍♀️',
      },
    ];
    expect(search('polo').map(trimEmojis)).toEqual(expected);
  });

  it('can search for thinking_face', () => {
    const expected = [
      {
        id: 'thinking_face',
        unified: '1f914',
        native: '🤔',
      },
    ];
    expect(search('thinking_fac').map(trimEmojis)).toEqual(expected);
  });

  it('can search for woman-facepalming', () => {
    const expected = [
      {
        id: 'woman-facepalming',
        unified: '1f926-200d-2640-fe0f',
        native: '🤦‍♀️',
      },
    ];
    expect(search('woman-facep').map(trimEmojis)).toEqual(expected);
  });
});
