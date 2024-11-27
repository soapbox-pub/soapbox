/**
 * Account normalizer:
 * Converts API accounts into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/account/}
 */
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import avatarMissing from 'soapbox/assets/images/avatar-missing.png';
import headerMissing from 'soapbox/assets/images/header-missing.png';
import { normalizeEmoji } from 'soapbox/normalizers/emoji.ts';
import { mergeDefined } from 'soapbox/utils/normalizers.ts';

import type { PatronAccount } from 'soapbox/reducers/patron.ts';
import type { Emoji, Field, EmbeddedEntity, Relationship } from 'soapbox/types/entities.ts';

// https://docs.joinmastodon.org/entities/account/
export const AccountRecord = ImmutableRecord({
  accepts_chat_messages: false,
  acct: '',
  avatar: '',
  avatar_static: '',
  birthday: '',
  bot: false,
  chats_onboarded: true,
  created_at: '',
  discoverable: false,
  display_name: '',
  emojis: ImmutableList<Emoji>(),
  favicon: '',
  fields: ImmutableList<Field>(),
  followers_count: 0,
  following_count: 0,
  fqn: '',
  header: '',
  header_static: '',
  id: '',
  last_status_at: '',
  location: '',
  locked: false,
  moved: null as EmbeddedEntity<any>,
  mute_expires_at: null as string | null,
  note: '',
  pleroma: ImmutableMap<string, any>(),
  source: ImmutableMap<string, any>(),
  statuses_count: 0,
  uri: '',
  url: '',
  username: '',
  website: '',
  verified: false,

  // Internal fields
  admin: false,
  domain: '',
  moderator: false,
  patron: null as PatronAccount | null,
  relationship: null as Relationship | null,
  should_refetch: false,
  staff: false,
});

// https://docs.joinmastodon.org/entities/field/
export const FieldRecord = ImmutableRecord({
  name: '',
  value: '',
  verified_at: null as Date | null,
});

// https://gitlab.com/soapbox-pub/soapbox/-/issues/549
const normalizePleromaLegacyFields = (account: ImmutableMap<string, any>) => {
  return account.update('pleroma', ImmutableMap(), (pleroma: ImmutableMap<string, any>) => {
    return pleroma.withMutations(pleroma => {
      const legacy = ImmutableMap({
        is_active: !pleroma.get('deactivated'),
        is_confirmed: !pleroma.get('confirmation_pending'),
        is_approved: !pleroma.get('approval_pending'),
      });

      pleroma.mergeWith(mergeDefined, legacy);
      pleroma.deleteAll(['deactivated', 'confirmation_pending', 'approval_pending']);
    });
  });
};

/** Add avatar, if missing */
const normalizeAvatar = (account: ImmutableMap<string, any>) => {
  const avatar = account.get('avatar');
  const avatarStatic = account.get('avatar_static');

  return account.withMutations(account => {
    account.set('avatar', avatar || avatarStatic || avatarMissing);
    account.set('avatar_static', avatarStatic || avatar || avatarMissing);
  });
};

/** Add header, if missing */
const normalizeHeader = (account: ImmutableMap<string, any>) => {
  const header = account.get('header');
  const headerStatic = account.get('header_static');

  return account.withMutations(account => {
    account.set('header', header || headerStatic || headerMissing);
    account.set('header_static', headerStatic || header || headerMissing);
  });
};

/** Normalize custom fields */
const normalizeFields = (account: ImmutableMap<string, any>) => {
  return account.update('fields', ImmutableList(), fields => fields.map(FieldRecord));
};

/** Normalize emojis */
const normalizeEmojis = (entity: ImmutableMap<string, any>) => {
  const emojis = entity.get('emojis', ImmutableList()).map(normalizeEmoji);
  return entity.set('emojis', emojis);
};

/** Normalize Pleroma/Fedibird birthday */
const normalizeBirthday = (account: ImmutableMap<string, any>) => {
  const birthday = [
    account.getIn(['pleroma', 'birthday']),
    account.getIn(['other_settings', 'birthday']),
  ].find(Boolean);

  return account.set('birthday', birthday);
};

/** Get Pleroma tags */
const getTags = (account: ImmutableMap<string, any>): ImmutableList<any> => {
  const tags = account.getIn(['pleroma', 'tags']);
  return ImmutableList(ImmutableList.isList(tags) ? tags : []);
};

/** Normalize Truth Social/Pleroma verified */
const normalizeVerified = (account: ImmutableMap<string, any>) => {
  return account.update('verified', verified => {
    return [
      verified === true,
      getTags(account).includes('verified'),
    ].some(Boolean);
  });
};

/** Upgrade legacy donor tag to a badge. */
const normalizeDonor = (account: ImmutableMap<string, any>) => {
  const tags = getTags(account);
  const updated = tags.includes('donor') ? tags.push('badge:donor') : tags;
  return account.setIn(['pleroma', 'tags'], updated);
};

/** Normalize Fedibird/Truth Social/Pleroma location */
const normalizeLocation = (account: ImmutableMap<string, any>) => {
  return account.update('location', location => {
    return [
      location,
      account.getIn(['pleroma', 'location']),
      account.getIn(['other_settings', 'location']),
    ].find(Boolean);
  });
};

/** Set username from acct, if applicable */
const fixUsername = (account: ImmutableMap<string, any>) => {
  const acct = account.get('acct') || '';
  const username = account.get('username') || '';
  return account.set('username', username || acct.split('@')[0]);
};

/** Set display name from username, if applicable */
const fixDisplayName = (account: ImmutableMap<string, any>) => {
  const displayName = account.get('display_name') || '';
  return account.set('display_name', displayName.trim().length === 0 ? account.get('username') : displayName);
};

const getDomainFromURL = (account: ImmutableMap<string, any>): string => {
  try {
    const url = account.get('url');
    return new URL(url).host;
  } catch {
    return '';
  }
};

export const guessFqn = (account: ImmutableMap<string, any>): string => {
  const acct = account.get('acct', '');
  const [user, domain] = acct.split('@');

  if (domain) {
    return acct;
  } else {
    return [user, getDomainFromURL(account)].join('@');
  }
};

const normalizeFqn = (account: ImmutableMap<string, any>) => {
  const fqn = account.get('fqn') || guessFqn(account);
  return account.set('fqn', fqn);
};

const normalizeFavicon = (account: ImmutableMap<string, any>) => {
  const favicon = account.getIn(['pleroma', 'favicon']) || '';
  return account.set('favicon', favicon);
};

const addDomain = (account: ImmutableMap<string, any>) => {
  const domain = account.get('fqn', '').split('@')[1] || '';
  return account.set('domain', domain);
};

const addStaffFields = (account: ImmutableMap<string, any>) => {
  const admin = account.getIn(['pleroma', 'is_admin']) === true;
  const moderator = account.getIn(['pleroma', 'is_moderator']) === true;
  const staff = admin || moderator;

  return account.merge({
    admin,
    moderator,
    staff,
  });
};

const normalizeDiscoverable = (account: ImmutableMap<string, any>) => {
  const discoverable = Boolean(account.get('discoverable') || account.getIn(['source', 'pleroma', 'discoverable']));
  return account.set('discoverable', discoverable);
};

/** Normalize message acceptance between Pleroma and Truth Social. */
const normalizeMessageAcceptance = (account: ImmutableMap<string, any>) => {
  const acceptance = Boolean(account.getIn(['pleroma', 'accepts_chat_messages']) || account.get('accepting_messages'));
  return account.set('accepts_chat_messages', acceptance);
};

/** Normalize undefined/null birthday to empty string. */
const fixBirthday = (account: ImmutableMap<string, any>) => {
  const birthday = account.get('birthday');
  return account.set('birthday', birthday || '');
};

/** Rewrite `<p></p>` to empty string. */
const fixNote = (account: ImmutableMap<string, any>) => {
  if (account.get('note') === '<p></p>') {
    return account.set('note', '');
  } else {
    return account;
  }
};

export const normalizeAccount = (account: Record<string, any>) => {
  return AccountRecord(
    ImmutableMap(fromJS(account)).withMutations(account => {
      normalizePleromaLegacyFields(account);
      normalizeEmojis(account);
      normalizeAvatar(account);
      normalizeHeader(account);
      normalizeFields(account);
      normalizeVerified(account);
      normalizeDonor(account);
      normalizeBirthday(account);
      normalizeLocation(account);
      normalizeFqn(account);
      normalizeFavicon(account);
      normalizeDiscoverable(account);
      normalizeMessageAcceptance(account);
      addDomain(account);
      addStaffFields(account);
      fixUsername(account);
      fixDisplayName(account);
      fixBirthday(account);
      fixNote(account);
    }),
  );
};
