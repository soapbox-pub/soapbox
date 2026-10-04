import type { Account } from '@/types/entities.ts';

/** Convert a plain tag into a badge. */
const tagToBadge = (tag: string) => `badge:${tag}`;

/** Convert a badge into a plain tag. */
const badgeToTag = (badge: string) => badge.replace(/^badge:/, '');

/** Difference between an old and new set of tags. */
interface TagDiff {
  /** New tags that were added. */
  added: string[];
  /** Old tags that were removed. */
  removed: string[];
}

/** Returns the differences between two sets of tags. */
const getTagDiff = (oldTags: string[], newTags: string[]): TagDiff => {
  const o = [...new Set(oldTags)];
  const n = [...new Set(newTags)];

  return {
    added: n.filter(tag => !o.includes(tag)),
    removed: o.filter(tag => !n.includes(tag)),
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