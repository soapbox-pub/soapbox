import { OrderedSet as ImmutableOrderedSet } from 'immutable';

import type { Account } from 'soapbox/types/entities';

/** Convert a plain tag into a badge. */
const tagToBadge = (tag: string) => `badge:${tag}`;

/** Convert a badge into a plain tag. */
const badgeToTag = (badge: string) => badge.replace(/^badge:/, '');

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

/** Returns only tags which are badges. */
const filterBadges = (tags: string[]): string[] => {
  return tags.filter(tag => tag.startsWith('badge:'));
};

/** Get badges from an account. */
const getBadges = (account: Pick<Account, 'pleroma'>) => {
  const tags = account?.pleroma?.tags ?? [];
  return filterBadges(tags);
};

export {
  tagToBadge,
  badgeToTag,
  filterBadges,
  getTagDiff,
  getBadges,
};