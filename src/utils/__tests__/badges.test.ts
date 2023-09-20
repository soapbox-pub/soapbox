import { buildAccount } from 'soapbox/jest/factory';

import {
  tagToBadge,
  badgeToTag,
  filterBadges,
  getTagDiff,
  getBadges,
} from '../badges';

test('tagToBadge', () => {
  expect(tagToBadge('yolo')).toEqual('badge:yolo');
});

test('badgeToTag', () => {
  expect(badgeToTag('badge:yolo')).toEqual('yolo');
  expect(badgeToTag('badge:badge:')).toEqual('badge:');
});

test('filterBadges', () => {
  const tags = ['one', 'badge:two', 'badge:three', 'four'];
  const badges = ['badge:two', 'badge:three'];
  expect(filterBadges(tags)).toEqual(badges);
});

test('getTagDiff', () => {
  const oldTags = ['one', 'two', 'three'];
  const newTags = ['three', 'four', 'five'];

  const expected = {
    added: ['four', 'five'],
    removed: ['one', 'two'],
  };

  expect(getTagDiff(oldTags, newTags)).toEqual(expected);
});

test('getBadges', () => {
  const account = buildAccount({ id: '1', pleroma: { tags: ['a', 'b', 'badge:c'] } });
  expect(getBadges(account)).toEqual(['badge:c']);
});