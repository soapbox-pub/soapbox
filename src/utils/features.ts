/* eslint sort-keys: "error" */
import { createSelector } from 'reselect';
import semverCoerce from 'semver/functions/coerce';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';
import semverParse from 'semver/functions/parse';

import { custom } from 'soapbox/custom';
import { type Instance } from 'soapbox/schemas';

/** Import custom overrides, if exists */
const overrides = custom('features');

/** Truthy array convenience function */
const any = (arr: Array<any>): boolean => arr.some(Boolean);

/**
 * Firefish, a fork of Misskey. Formerly known as Calckey.
 * @see {@link https://joinfirefish.org/}
 */
export const FIREFISH = 'Firefish';

/**
 * Ditto, a Nostr server with Mastodon API.
 * @see {@link https://gitlab.com/soapbox-pub/ditto}
 */
export const DITTO = 'Ditto';

/**
 * Friendica, decentralized social platform implementing multiple federation protocols.
 * @see {@link https://friendi.ca/}
 */
export const FRIENDICA = 'Friendica';

/**
 * Mastodon, the software upon which this is all based.
 * @see {@link https://joinmastodon.org/}
 */
export const MASTODON = 'Mastodon';

/**
 * Mitra, a Rust backend with cryptocurrency integrations.
 * @see {@link https://codeberg.org/silverpill/mitra}
 */
export const MITRA = 'Mitra';

/**
 * Pixelfed, a federated image sharing platform.
 * @see {@link https://pixelfed.org/}
 */
export const PIXELFED = 'Pixelfed';

/**
 * Pleroma, a feature-rich alternative written in Elixir.
 * @see {@link https://pleroma.social/}
 */
export const PLEROMA = 'Pleroma';

/**
 * Takahē, backend with support for serving multiple domains.
 * @see {@link https://jointakahe.org/}
 */
export const TAKAHE = 'Takahe';

/**
 * Truth Social, the Mastodon fork powering truthsocial.com
 * @see {@link https://help.truthsocial.com/open-source}
 */
export const TRUTHSOCIAL = 'TruthSocial';

/**
 * Wildebeest, backend running on top of Cloudflare Pages.
 */
export const WILDEBEEST = 'Wildebeest';

/**
 * Akkoma, a Pleroma fork.
 * @see {@link https://akkoma.dev/AkkomaGang/akkoma}
 */
export const AKKOMA = 'akkoma';

/**
 * glitch-soc, fork of Mastodon with a number of experimental features.
 * @see {@link https://glitch-soc.github.io/docs/}
 */
export const GLITCH = 'glitch';

/**
 * Rebased, the recommended backend for Soapbox.
 * @see {@link https://gitlab.com/soapbox-pub/rebased}
 */
// NOTE: Rebased is named 'soapbox' for legacy reasons.
export const REBASED = 'soapbox';

/** Backend name reserved only for tests. */
export const UNRELEASED = 'unreleased';

/** Parse features for the given instance */
const getInstanceFeatures = (instance: Instance) => {
  const v = parseVersion(instance.version);
  const { features, federation } = instance.pleroma.metadata;

  return {
    /**
     * Can view and manage ActivityPub aliases through the API.
     * @see GET /api/pleroma/aliases
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountAliases: v.software === PLEROMA,

    /**
     * The accounts API allows an acct instead of an ID.
     * @see GET /api/v1/accounts/:acct_or_id
     */
    accountByUsername: v.software === PLEROMA,

    /**
     * Ability to create accounts.
     * @see POST /api/v1/accounts
     */
    accountCreation: v.software !== TRUTHSOCIAL,

    /**
     * Ability to pin other accounts on one's profile.
     * @see POST /api/v1/accounts/:id/pin
     * @see POST /api/v1/accounts/:id/unpin
     * @see GET /api/v1/pleroma/accounts/:id/endorsements
     */
    accountEndorsements: v.software === PLEROMA && gte(v.version, '2.4.50'),

    /**
     * Ability to set one's location on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountLocation: any([
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.4.50'),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Look up an account by the acct.
     * @see GET /api/v1/accounts/lookup
     */
    accountLookup: any([
      v.software === FIREFISH,
      v.software === MASTODON && gte(v.compatVersion, '3.4.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
      v.software === TAKAHE && gte(v.version, '0.6.1'),
      v.software === TRUTHSOCIAL,
      v.software === DITTO,
    ]),

    /**
     * Move followers to a different ActivityPub account.
     * @see POST /api/pleroma/move_account
     */
    accountMoving: v.software === PLEROMA && gte(v.version, '2.4.50'),

    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/accounts/:id/follow
     */
    accountNotifies: any([
      v.software === MASTODON && gte(v.compatVersion, '3.3.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Ability to subscribe to notifications every time an account posts.
     * @see POST /api/v1/pleroma/accounts/:id/subscribe
     * @see POST /api/v1/pleroma/accounts/:id/unsubscribe
     */
    accountSubscriptions: v.software === PLEROMA && gte(v.version, '1.0.0'),

    /**
     * Ability to set one's website on their profile.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    accountWebsite: v.software === TRUTHSOCIAL,

    /**
     * An additional moderator interface is available on the domain.
     * @see /pleroma/admin
     */
    adminFE: v.software === PLEROMA,

    /**
     * Can display announcements set by admins.
     * @see GET /api/v1/announcements
     * @see POST /api/v1/announcements/:id/dismiss
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcements: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.0'),
      v.software === PLEROMA && gte(v.version, '2.2.49'),
    ]),

    /**
     * Can emoji react to announcements set by admins.
     * @see PUT /api/v1/announcements/:id/reactions/:name
     * @see DELETE /api/v1/announcements/:id/reactions/:name
     * @see {@link https://docs.joinmastodon.org/methods/announcements/}
     */
    announcementsReactions: v.software === MASTODON && gte(v.compatVersion, '3.1.0'),

    /**
     * Pleroma backups.
     * @see GET /api/v1/pleroma/backups
     * @see POST /api/v1/pleroma/backups
     */
    backups: v.software === PLEROMA,

    /**
     * Set your birthday and view upcoming birthdays.
     * @see GET /api/v1/pleroma/birthdays
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     */
    birthdays: v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.4.50'),

    /** Whether people who blocked you are visible through the API. */
    blockersVisible: features.includes('blockers_visible'),

    /**
     * Can bookmark statuses.
     * @see POST /api/v1/statuses/:id/bookmark
     * @see GET /api/v1/bookmarks
     */
    bookmarks: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON && gte(v.compatVersion, '3.1.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
      v.software === PIXELFED,
    ]),

    /**
     * Accounts can be marked as bots.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    bots: any([
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * Ability to accept a chat.
     * POST /api/v1/pleroma/chats/:id/accept
     */
    chatAcceptance: v.software === TRUTHSOCIAL,

    /**
     * Ability to add reactions to chat messages.
     */
    chatEmojiReactions: v.software === TRUTHSOCIAL,

    /**
     * Pleroma chats API.
     * @see {@link https://docs.pleroma.social/backend/development/API/chats/}
     */
    chats: any([
      v.software === TRUTHSOCIAL,
      features.includes('pleroma_chat_messages'),
    ]),

    /**
     * Ability to delete a chat.
     * @see DELETE /api/v1/pleroma/chats/:id
     */
    chatsDelete: any([
      v.software === TRUTHSOCIAL,
      v.build === REBASED,
    ]),

    /**
     * Ability to set disappearing messages on chats.
     * @see PATCH /api/v1/pleroma/chats/:id
     */
    chatsExpiration: v.software === TRUTHSOCIAL,

    /**
     * Whether chat messages can accept a `media_id` attachment.
     * @see POST /api/v1/pleroma/chats/:id/messages
     */
    chatsMedia: v.software !== TRUTHSOCIAL || v.build === UNRELEASED,

    /**
     * Whether chat messages have read receipts.
     * @see GET /api/v1/pleroma/chats/:id/messages
     */
    chatsReadReceipts: v.software === TRUTHSOCIAL,

    /**
     * Ability to search among chats.
     * @see GET /api/v1/pleroma/chats
     */
    chatsSearch: v.software === TRUTHSOCIAL,

    /**
     * Paginated chats API.
     * @see GET /api/v2/pleroma/chats
     */
    chatsV2: any([
      v.software === TRUTHSOCIAL,
      v.software === PLEROMA && gte(v.version, '2.3.0'),
    ]),

    /**
     * Ability to only chat with people that follow you.
     */
    chatsWithFollowers: v.software === TRUTHSOCIAL,

    /**
     * Mastodon's newer solution for direct messaging.
     * @see {@link https://docs.joinmastodon.org/methods/conversations/}
     */
    conversations: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON && gte(v.compatVersion, '2.6.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
      v.software === PIXELFED,
      v.software === TAKAHE,
    ]),

    /**
     * Ability to add non-standard reactions to a status.
     */
    customEmojiReacts: any([
      features.includes('pleroma_custom_emoji_reactions'),
      features.includes('custom_emoji_reactions'),
      v.software === PLEROMA && gte(v.version, '2.5.50'),
    ]),

    /**
     * Legacy DMs timeline where messages are displayed chronologically without groupings.
     * @see GET /api/v1/timelines/direct
     */
    directTimeline: any([
      v.software === FRIENDICA,
      v.software === MASTODON && lt(v.compatVersion, '3.0.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
    ]),

    /**
     * @see POST /api/friendica/statuses/:id/dislike
     * @see POST /api/friendica/statuses/:id/undislike
     * @see GET  /api/friendica/statuses/:id/disliked_by
     */
    dislikes: v.software === FRIENDICA && gte(v.version, '2023.3.0'),

    /**
     * Ability to edit profile information.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    editProfile: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON,
      v.software === MITRA,
      v.software === PIXELFED,
      v.software === PLEROMA,
      v.software === TAKAHE && gte(v.version, '0.7.0'),
      v.software === TRUTHSOCIAL,
      v.software === WILDEBEEST,
    ]),

    editStatuses: any([
      v.software === FRIENDICA && gte(v.version, '2022.12.0'),
      v.software === MASTODON && gte(v.version, '3.5.0'),
      features.includes('editing'),
    ]),

    /**
     * Soapbox email list.
     * @see POST /api/v1/accounts
     * @see PATCH /api/v1/accounts/update_credentials
     * @see GET /api/v1/pleroma/admin/email_list/subscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/unsubscribers.csv
     * @see GET /api/v1/pleroma/admin/email_list/combined.csv
     */
    emailList: features.includes('email_list'),

    /**
     * Ability to embed posts on external sites.
     * @see GET /api/oembed
     */
    embeds: any([
      v.software === MASTODON,
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Ability to add emoji reactions to a status.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     * @see GET /api/v1/pleroma/statuses/:id/reactions/:emoji?
     * @see DELETE /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiReacts: v.software === PLEROMA && gte(v.version, '2.0.0'),

    /**
     * The backend allows only non-RGI ("Recommended for General Interchange") emoji reactions.
     * @see PUT /api/v1/pleroma/statuses/:id/reactions/:emoji
     */
    emojiReactsNonRGI: v.software === PLEROMA && lt(v.version, '2.2.49'),

    /**
     * Ability to create and perform actions on events.
     * @see POST /api/v1/pleroma/events
     * @see GET /api/v1/pleroma/events/joined_events
     * @see PUT /api/v1/pleroma/events/:id
     * @see GET /api/v1/pleroma/events/:id/participations
     * @see GET /api/v1/pleroma/events/:id/participation_requests
     * @see POST /api/v1/pleroma/events/:id/participation_requests/:participant_id/authorize
     * @see POST /api/v1/pleroma/events/:id/participation_requests/:participant_id/reject
     * @see POST /api/v1/pleroma/events/:id/join
     * @see POST /api/v1/pleroma/events/:id/leave
     * @see GET /api/v1/pleroma/events/:id/ics
     * @see GET /api/v1/pleroma/search/location
     */
    events: features.includes('events'),

    /**
     * Ability to address recipients of a status explicitly (with `to`).
     * @see POST /api/v1/statuses
     */
    explicitAddressing: any([
      v.software === PLEROMA && gte(v.version, '1.0.0'),
      v.software === TRUTHSOCIAL,
    ]),

    /** Whether to allow exporting follows/blocks/mutes to CSV by paginating the API. */
    exportData: true,

    /** Whether the accounts who favourited or emoji-reacted to a status can be viewed through the API. */
    exposableReactions: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON,
      v.software === TAKAHE && gte(v.version, '0.6.1'),
      v.software === TRUTHSOCIAL,
      features.includes('exposable_reactions'),
    ]),

    /**
     * Can see accounts' followers you know
     * @see GET /api/v1/accounts/familiar_followers
     */
    familiarFollowers: any([
      v.software === MASTODON && gte(v.version, '3.5.0'),
      v.software === PLEROMA && gte(v.version, '2.5.51') && v.build === REBASED,
      v.software === TAKAHE,
    ]),

    /** Whether the instance federates. */
    federating: federation.enabled,

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/filters/#v1}
     */
    filters: any([
      v.software === MASTODON && lt(v.compatVersion, '3.6.0'),
      v.software === PLEROMA,
    ]),

    /** Whether filters can automatically expires. */
    filtersExpiration: any([
      v.software === MASTODON,
      v.software === PLEROMA && gte(v.version, '2.3.0'),
    ]),

    /**
     * Can edit and manage timeline filters (aka "muted words").
     * @see {@link https://docs.joinmastodon.org/methods/filters/}
     */
    filtersV2: v.software === MASTODON && gte(v.compatVersion, '3.6.0'),

    /**
     * Allows setting the focal point of a media attachment.
     * @see {@link https://docs.joinmastodon.org/methods/media/}
     */
    focalPoint: v.software === MASTODON && gte(v.compatVersion, '2.3.0'),

    /**
     * Ability to follow hashtags.
     * @see POST /api/v1/tags/:name/follow
     * @see POST /api/v1/tags/:name/unfollow
     */
    followHashtags: any([
      v.software === MASTODON && gte(v.compatVersion, '4.0.0'),
      v.software === PLEROMA && v.build === AKKOMA,
    ]),

    /**
     * Ability to lock accounts and manually approve followers.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    followRequests: any([
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * Ability to list followed hashtags.
     * @see GET /api/v1/followed_tags
     */
    followedHashtagsList: v.software === MASTODON && gte(v.compatVersion, '4.1.0'),

    /**
     * Whether client settings can be retrieved from the API.
     * @see GET /api/pleroma/frontend_configurations
     */
    frontendConfigurations: any([
      v.software === PLEROMA,
      v.software === DITTO,
    ]),

    /**
     * Groups.
     * @see POST /api/v1/groups
     * @see GET /api/v1/groups
     * @see GET /api/v1/groups/:id
     * @see POST /api/v1/groups/:id/join
     * @see POST /api/v1/groups/:id/leave
     * @see GET /api/v1/groups/:id/memberships
     * @see PUT /api/v1/groups/:group_id
     * @see DELETE /api/v1/groups/:group_id
     * @see GET /api/v1/groups/:group_id/membership_requests
     * @see POST /api/v1/groups/:group_id/membership_requests/:account_id/authorize
     * @see POST /api/v1/groups/:group_id/membership_requests/:account_id/reject
     * @see DELETE /api/v1/groups/:group_id/statuses/:id
     * @see POST /api/v1/groups/:group_id/kick?account_ids[]=…
     * @see GET /api/v1/groups/:group_id/blocks
     * @see POST /api/v1/groups/:group_id/blocks?account_ids[]=…
     * @see DELETE /api/v1/groups/:group_id/blocks?account_ids[]=…
     * @see POST /api/v1/groups/:group_id/promote?role=new_role&account_ids[]=…
     * @see POST /api/v1/groups/:group_id/demote?role=new_role&account_ids[]=…
     * @see GET /api/v1/admin/groups
     * @see GET /api/v1/admin/groups/:group_id
     * @see POST /api/v1/admin/groups/:group_id/suspend
     * @see POST /api/v1/admin/groups/:group_id/unsuspend
     * @see DELETE /api/v1/admin/groups/:group_id
     */
    groups: v.software === TRUTHSOCIAL,

    /**
     * Cap # of Group Admins to 5
     */
    groupsAdminMax: v.software === TRUTHSOCIAL,

    /**
     * Can see trending/suggested Groups.
     */
    groupsDiscovery: v.software === TRUTHSOCIAL,

    /**
     * Can kick user from Group.
     */
    groupsKick: v.software !== TRUTHSOCIAL,

    /**
     * Can mute a Group.
     */
    groupsMuting: v.software === TRUTHSOCIAL,

    /**
     * Can query pending Group requests.
    */
    groupsPending: v.software === TRUTHSOCIAL,

    /**
    * Can promote members to Admins.
    */
    groupsPromoteToAdmin: v.software !== TRUTHSOCIAL,

    /**
     * Can search my own groups.
     */
    groupsSearch: v.software === TRUTHSOCIAL,

    /**
     * Can see topics for Groups.
     */
    groupsTags: v.software === TRUTHSOCIAL,

    /**
     * Can validate group names.
     */
    groupsValidation: v.software === TRUTHSOCIAL,

    /**
     * Can hide follows/followers lists and counts.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    hideNetwork: v.software === PLEROMA,

    /**
     * Pleroma import API.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/pleroma/mutes_import
     */
    import: v.software === PLEROMA,

    /**
     * Pleroma import endpoints.
     * @see POST /api/pleroma/follow_import
     * @see POST /api/pleroma/blocks_import
     * @see POST /api/pleroma/mutes_import
     */
    importData: v.software === PLEROMA && gte(v.version, '2.2.0'),

    /**
     * Can create, view, and manage lists.
     * @see {@link https://docs.joinmastodon.org/methods/lists/}
     * @see GET /api/v1/timelines/list/:list_id
     */
    lists: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON && gte(v.compatVersion, '2.1.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
    ]),

    /**
     * Can sign in using username instead of e-mail address.
     */
    logInWithUsername: any([
      v.software === PLEROMA,
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Can perform moderation actions with account and reports.
     * @see {@link https://docs.joinmastodon.org/methods/admin/}
     * @see GET /api/v1/admin/reports
     * @see POST /api/v1/admin/reports/:report_id/resolve
     * @see POST /api/v1/admin/reports/:report_id/reopen
     * @see POST /api/v1/admin/accounts/:account_id/action
     * @see POST /api/v1/admin/accounts/:account_id/approve
     */
    mastodonAdmin: any([
      v.software === MASTODON && gte(v.compatVersion, '2.9.1'),
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.4.50'),
    ]),

    /**
     * Can upload media attachments to statuses.
     * @see POST /api/v1/media
     * @see POST /api/v1/statuses
     */
    media: true,

    /**
     * Supports V2 media uploads.
     * @see POST /api/v2/media
     */
    mediaV2: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.3'),
      v.software === WILDEBEEST,
      // Even though Pleroma supports these endpoints, it has disadvantages
      // v.software === PLEROMA && gte(v.version, '2.1.0'),
    ]),

    /**
     * Ability to hide notifications from people you don't follow.
     * @see PUT /api/pleroma/notification_settings
     */
    muteStrangers: v.software === PLEROMA,

    /**
     * Ability to specify how long the account mute should last.
     * @see PUT /api/v1/accounts/:id/mute
     */
    mutesDuration: any([
      v.software === PLEROMA && gte(v.version, '2.3.0'),
      v.software === MASTODON && gte(v.compatVersion, '3.3.0'),
    ]),

    /**
     * Ability to sign Nostr events over websocket.
     * @see GET /api/v1/streaming?stream=nostr
     */
    nostrSign: v.software === DITTO,

    /**
     * Whether the backend uses Ditto's Nosteric way of registration.
     * @see POST /api/v1/accounts
     */
    nostrSignup: v.software === DITTO,

    /**
     * Add private notes to accounts.
     * @see POST /api/v1/accounts/:id/note
     * @see GET /api/v1/accounts/relationships
     */
    notes: any([
      v.software === MASTODON && gte(v.compatVersion, '3.2.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
    ]),

    /**
     * Allows specifying notification types to include, rather than to exclude.
     * @see GET /api/v1/notifications
     */
    notificationsIncludeTypes: any([
      v.software === MASTODON && gte(v.compatVersion, '3.5.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
      v.software === TAKAHE && gte(v.version, '0.6.2'),
    ]),

    /**
     * Supports pagination in threads.
     * @see GET /api/v1/statuses/:id/context/ancestors
     * @see GET /api/v1/statuses/:id/context/descendants
     */
    paginatedContext: v.software === TRUTHSOCIAL,

    /**
     * Displays a form to follow a user when logged out.
     * @see POST /main/ostatus
     */
    pleromaRemoteFollow: v.software === PLEROMA,

    /**
     * Can add polls to statuses.
     * @see POST /api/v1/statuses
     */
    polls: any([
      v.software === FIREFISH,
      v.software === MASTODON && gte(v.version, '2.8.0'),
      v.software === PLEROMA,
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Can set privacy scopes on statuses.
     * @see POST /api/v1/statuses
     */
    privacyScopes: ![TRUTHSOCIAL, DITTO].includes(v.software!),

    /**
     * A directory of discoverable profiles from the instance.
     * @see {@link https://docs.joinmastodon.org/methods/directory/}
     */
    profileDirectory: any([
      v.software === FRIENDICA,
      v.software === MASTODON && gte(v.compatVersion, '3.0.0'),
      features.includes('profile_directory'),
    ]),

    /**
     * Ability to set custom profile fields.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    profileFields: any([
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * Can display a timeline of all known public statuses.
     * Local and Fediverse timelines both use this feature.
     * @see GET /api/v1/timelines/public
     */
    publicTimeline: any([
      v.software === FIREFISH,
      v.software === FRIENDICA,
      v.software === MASTODON,
      v.software === PLEROMA,
      v.software === TAKAHE,
      v.software === WILDEBEEST,
      v.software === DITTO,
    ]),

    /**
     * Ability to quote posts in statuses.
     * @see POST /api/v1/statuses
     */
    quotePosts: any([
      v.software === FRIENDICA && gte(v.version, '2023.3.0'),
      v.software === PLEROMA && [REBASED, AKKOMA].includes(v.build!) && gte(v.version, '2.4.50'),
      features.includes('quote_posting'),
      instance.feature_quote === true,
    ]),

    /**
     * Interact with statuses from another instance while logged-out.
     * @see POST /api/v1/pleroma/remote_interaction
     */
    remoteInteractions: v.software === PLEROMA && gte(v.version, '2.4.50'),

    /**
     * Ability to remove an account from your followers.
     * @see POST /api/v1/accounts/:id/remove_from_followers
     */
    removeFromFollowers: any([
      v.software === MASTODON && gte(v.compatVersion, '3.5.0'),
      v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.4.50'),
    ]),

    /**
     * Ability to report chat messages.
     * @see POST /api/v1/reports
     */
    reportChats: v.software === TRUTHSOCIAL,

    /**
     * Ability to select more than one status when reporting.
     * @see POST /api/v1/reports
     */
    reportMultipleStatuses: v.software !== TRUTHSOCIAL,

    /**
     * Can request a password reset email through the API.
     * @see POST /auth/password
     */
    resetPassword: v.software === PLEROMA,

    /**
     * Ability to post statuses in Markdown, BBCode, and HTML.
     * @see POST /api/v1/statuses
     */
    richText: any([
      v.software === MASTODON && v.build === GLITCH,
      v.software === PLEROMA,
    ]),

    /**
     * Ability to follow account feeds using RSS.
     */
    rssFeeds: any([
      v.software === MASTODON,
      v.software === PLEROMA,
    ]),

    /**
     * Can schedule statuses to be posted at a later time.
     * @see POST /api/v1/statuses
     * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/}
     */
    scheduledStatuses: any([
      v.software === FRIENDICA,
      v.software === MASTODON && gte(v.version, '2.7.0'),
      v.software === PLEROMA,
    ]),

    /**
     * Ability to search statuses from the given account.
     * @see {@link https://docs.joinmastodon.org/methods/search/}
     * @see POST /api/v2/search
     */
    searchFromAccount: any([
      v.software === MASTODON && gte(v.version, '2.8.0'),
      v.software === PLEROMA && gte(v.version, '1.0.0'),
    ]),

    /**
     * Ability to manage account security settings.
     * @see POST /api/pleroma/change_password
     * @see POST /api/pleroma/change_email
     * @see POST /api/pleroma/delete_account
     */
    security: any([
      v.software === PLEROMA,
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Ability to manage account sessions.
     * @see GET /api/oauth_tokens.json
     * @see DELETE /api/oauth_tokens/:id
     */
    sessions: v.software === PLEROMA,

    /**
     * Can store client settings in the database.
     * @see PATCH /api/v1/accounts/update_credentials
     */
    settingsStore: any([
      v.software === PLEROMA,
      v.software === TRUTHSOCIAL,
    ]),

    /**
     * Can set content warnings on statuses.
     * @see POST /api/v1/statuses
     */
    spoilers: v.software !== TRUTHSOCIAL,

    /**
     * Can display suggested accounts.
     * @see {@link https://docs.joinmastodon.org/methods/suggestions/}
     */
    suggestions: any([
      v.software === MASTODON && gte(v.compatVersion, '2.4.3'),
      v.software === TRUTHSOCIAL,
      features.includes('v2_suggestions'),
    ]),

    /**
     * Supports V2 suggested accounts.
     * @see GET /api/v2/suggestions
     */
    suggestionsV2: any([
      v.software === FRIENDICA,
      v.software === MASTODON && gte(v.compatVersion, '3.4.0'),
      v.software === TRUTHSOCIAL,
      features.includes('v2_suggestions'),
    ]),

    /**
     * Can translate statuses.
     * @see POST /api/v1/statuses/:id/translate
     */
    translations: features.includes('translation'),

    /**
     * Trending statuses.
     * @see GET /api/v1/trends/statuses
     */
    trendingStatuses: any([
      v.software === FRIENDICA && gte(v.version, '2022.12.0'),
      v.software === MASTODON && gte(v.compatVersion, '3.5.0'),
    ]),

    /**
     * Can display trending hashtags.
     * @see GET /api/v1/trends
     */
    trends: any([
      v.software === FRIENDICA && gte(v.version, '2022.12.0'),
      v.software === MASTODON && gte(v.compatVersion, '3.0.0'),
      v.software === TRUTHSOCIAL,
      v.software === DITTO,
    ]),

    /**
     * Whether the backend allows adding users you don't follow to lists.
     * @see POST /api/v1/lists/:id/accounts
     */
    unrestrictedLists: v.software === PLEROMA,
  };
};

/** Features available from a backend */
export type Features = ReturnType<typeof getInstanceFeatures>;

/** Detect backend features to conditionally render elements */
export const getFeatures = createSelector([
  (instance: Instance) => instance,
], (instance): Features => {
  const features = getInstanceFeatures(instance);
  return Object.assign(features, overrides) as Features;
});

/** Fediverse backend */
interface Backend {
  /** Build name, if this software is a fork */
  build: string | null;
  /** Name of the software */
  software: string | null;
  /** API version number */
  version: string;
  /** Mastodon API version this backend is compatible with */
  compatVersion: string;
}

/** Get information about the software from its version string */
export const parseVersion = (version: string): Backend => {
  const regex = /^([\w+.-]*)(?: \(compatible; ([\w]*) (.*)\))?$/;
  const match = regex.exec(version);

  const semverString = match && (match[3] || match[1]);
  const semver = match ? semverParse(semverString) || semverCoerce(semverString, {
    loose: true,
  }) : null;
  const compat = match ? semverParse(match[1]) || semverCoerce(match[1]) : null;

  if (match && semver && compat) {
    return {
      build: semver.build[0],
      compatVersion: compat.version,
      software: match[2] || MASTODON,
      version: semver.version,
    };
  } else {
    // If we can't parse the version, this is a new and exotic backend.
    // Fall back to minimal featureset.
    return {
      build: null,
      compatVersion: '0.0.0',
      software: null,
      version: '0.0.0',
    };
  }
};
