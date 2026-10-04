import type { Account } from '@/schemas/index.ts';

// Utility types
type APIEntity = Record<string, any>;
type EmbeddedEntity<T extends object> = null | string | T;

export type {
  Account,

  // Utility types
  APIEntity,
  EmbeddedEntity,
};

export type {
  AdminAccount,
  AdminReport,
  Attachment,
  Chat,
  ChatMessage,
  Emoji,
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
} from '@/normalizers/index.ts';

export type {
  Card,
  EmojiReaction,
  Group,
  GroupMember,
  GroupRelationship,
  Poll,
  PollOption,
  Relationship,
} from '@/schemas/index.ts';
