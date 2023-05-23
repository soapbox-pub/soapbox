import { OrderedSet as ImmutableOrderedSet } from 'immutable';

import type { Account } from 'soapbox/schemas';

/** Custom tag with a `badge:` prefix. */
type Badge = `badge:${string}`;

/** Convert a plain tag into a badge. */
const tagToBadge = (tag: string): Badge => `badge:${tag}`;

/** Convert a badge into a plain tag. */
const badgeToTag = (badge: Badge): string => badge.replace(/^badge:/, '');

/** Difference between an old and new set of tags. */
interface TagDiff {
  /** New tags that were added. */
  added: string[]
  /** Old tags that were removed. */
  removed: string[]
}

/** Returns the differences between two sets of tags. */
const getTagDiff = (oldTags: string[], newTags: string[]): TagDiff => {
  const o = ImmutableOrderedSet(oldTags);
  const n = ImmutableOrderedSet(newTags);

  return {
    added: n.subtract(o).toArray(),
    removed: o.subtract(n).toArray(),
  };
};

/** Determine whether a tag is a custom badge. */
const isBadge = (tag: string): tag is Badge => tag.startsWith('badge:');

/** Returns only tags which are badges. */
const filterBadges = (tags: string[]): Badge[] => {
  return tags.filter(isBadge);
};

/** Get badges from an account. */
const getBadges = (account: Account): Badge[] => {
  return filterBadges(account.pleroma.tags);
};

export {
  tagToBadge,
  badgeToTag,
  filterBadges,
  getTagDiff,
  getBadges,
};