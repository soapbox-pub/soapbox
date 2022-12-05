import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import { unescapeHTML } from './html';

/** Use new value only if old value is undefined */
export const mergeDefined = (oldVal: any, newVal: any) => oldVal === undefined ? newVal : oldVal;

export const makeEmojiMap = (emojis: any) => emojis.reduce((obj: any, emoji: any) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

/** Normalize entity ID */
export const normalizeId = (id: any): string | null => {
  return typeof id === 'string' ? id : null;
};

/** Gets titles of poll options from status. */
const getPollOptionTitles = (status: ImmutableMap<string, any>): ImmutableList<string> => {
  const poll = status.get('poll');

  if (poll && typeof poll === 'object') {
    return poll.get('options').map((option: ImmutableMap<string, any>) => option.get('title'));
  } else {
    return ImmutableList();
  }
};

/** Gets usernames of mentioned users from status. */
const getMentionedUsernames = (status: ImmutableMap<string, any>): ImmutableList<string> => {
  return status.get('mentions').map((mention: ImmutableMap<string, any>) => `@${mention.get('acct')}`);
};

/** Creates search text from the status. */
export const buildSearchContent = (status: ImmutableMap<string, any>): string => {
  const pollOptionTitles = getPollOptionTitles(status);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = ImmutableList([
    status.get('spoiler_text'),
    status.get('content'),
  ]).concat(pollOptionTitles).concat(mentionedUsernames);

  return unescapeHTML(fields.join('\n\n')) || '';
};