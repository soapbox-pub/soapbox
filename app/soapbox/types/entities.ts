import {
  AdminAccountRecord,
  AdminReportRecord,
  AnnouncementRecord,
  AnnouncementReactionRecord,
  AttachmentRecord,
  ChatRecord,
  ChatMessageRecord,
  EmojiRecord,
  FieldRecord,
  FilterRecord,
  FilterKeywordRecord,
  FilterStatusRecord,
  HistoryRecord,
  InstanceRecord,
  ListRecord,
  LocationRecord,
  MentionRecord,
  NotificationRecord,
  StatusEditRecord,
  TagRecord,
} from 'soapbox/normalizers';
import { LogEntryRecord } from 'soapbox/reducers/admin-log';

import type { Record as ImmutableRecord } from 'immutable';

type AdminAccount = ReturnType<typeof AdminAccountRecord>;
type AdminLog = ReturnType<typeof LogEntryRecord>;
type AdminReport = ReturnType<typeof AdminReportRecord>;
type Announcement = ReturnType<typeof AnnouncementRecord>;
type AnnouncementReaction = ReturnType<typeof AnnouncementReactionRecord>;
type Attachment = ReturnType<typeof AttachmentRecord>;
type Chat = ReturnType<typeof ChatRecord>;
type ChatMessage = ReturnType<typeof ChatMessageRecord>;
type Emoji = ReturnType<typeof EmojiRecord>;
type Field = ReturnType<typeof FieldRecord>;
type Filter = ReturnType<typeof FilterRecord>;
type FilterKeyword = ReturnType<typeof FilterKeywordRecord>;
type FilterStatus = ReturnType<typeof FilterStatusRecord>;
type History = ReturnType<typeof HistoryRecord>;
type Instance = ReturnType<typeof InstanceRecord>;
type List = ReturnType<typeof ListRecord>;
type Location = ReturnType<typeof LocationRecord>;
type Mention = ReturnType<typeof MentionRecord>;
type Notification = ReturnType<typeof NotificationRecord>;
type StatusEdit = ReturnType<typeof StatusEditRecord>;
type Tag = ReturnType<typeof TagRecord>;

// Utility types
type APIEntity = Record<string, any>;
type EmbeddedEntity<T extends object> = null | string | ReturnType<ImmutableRecord.Factory<T>>;

export {
  AdminAccount,
  AdminLog,
  AdminReport,
  Announcement,
  AnnouncementReaction,
  Attachment,
  Chat,
  ChatMessage,
  Emoji,
  Field,
  Filter,
  FilterKeyword,
  FilterStatus,
  History,
  Instance,
  List,
  Location,
  Mention,
  Notification,
  StatusEdit,
  Tag,

  // Utility types
  APIEntity,
  EmbeddedEntity,
};

export type {
  Account,
  Card,
  EmojiReaction,
  Group,
  GroupMember,
  GroupRelationship,
  Poll,
  PollOption,
  Relationship,
  Status,
} from 'soapbox/schemas';