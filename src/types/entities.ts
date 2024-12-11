import {
  AdminAccountRecord,
  AdminReportRecord,
  AttachmentRecord,
  ChatRecord,
  ChatMessageRecord,
  EmojiRecord,
  FieldRecord,
  FilterRecord,
  FilterKeywordRecord,
  FilterStatusRecord,
  HistoryRecord,
  ListRecord,
  LocationRecord,
  MentionRecord,
  NotificationRecord,
  StatusEditRecord,
  StatusRecord,
  TagRecord,
} from 'soapbox/normalizers/index.ts';
import { Account as SchemaAccount } from 'soapbox/schemas/index.ts';

import type { Record as ImmutableRecord } from 'immutable';
import type { LegacyMap } from 'soapbox/utils/legacy.ts';

type AdminAccount = ReturnType<typeof AdminAccountRecord>;
type AdminReport = ReturnType<typeof AdminReportRecord>;
type Attachment = ReturnType<typeof AttachmentRecord>;
type Chat = ReturnType<typeof ChatRecord>;
type ChatMessage = ReturnType<typeof ChatMessageRecord>;
type Emoji = ReturnType<typeof EmojiRecord>;
type Field = ReturnType<typeof FieldRecord>;
type Filter = ReturnType<typeof FilterRecord>;
type FilterKeyword = ReturnType<typeof FilterKeywordRecord>;
type FilterStatus = ReturnType<typeof FilterStatusRecord>;
type History = ReturnType<typeof HistoryRecord>;
type List = ReturnType<typeof ListRecord>;
type Location = ReturnType<typeof LocationRecord>;
type Mention = ReturnType<typeof MentionRecord>;
type Notification = ReturnType<typeof NotificationRecord>;
type StatusEdit = ReturnType<typeof StatusEditRecord>;
type Tag = ReturnType<typeof TagRecord>;

type Account = SchemaAccount & LegacyMap;

/**
 * @deprecated Use the Status from 'soapbox/schemas/index.ts'
 */
interface Status extends ReturnType<typeof StatusRecord> {
  // HACK: same as above
  quote: EmbeddedEntity<Status>;
  reblog: EmbeddedEntity<Status>;
}

// Utility types
type APIEntity = Record<string, any>;
type EmbeddedEntity<T extends object> = null | string | ReturnType<ImmutableRecord.Factory<T>>;

export type {
  Account,
  AdminAccount,
  AdminReport,
  Attachment,
  Chat,
  ChatMessage,
  Emoji,
  Field,
  Filter,
  FilterKeyword,
  FilterStatus,
  History,
  List,
  Location,
  Mention,
  Notification,
  Status,
  StatusEdit,
  Tag,

  // Utility types
  APIEntity,
  EmbeddedEntity,
};

export type {
  Card,
  EmojiReaction,
  Group,
  GroupMember,
  GroupRelationship,
  Poll,
  PollOption,
  Relationship,
} from 'soapbox/schemas/index.ts';