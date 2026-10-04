import { fromDefaults } from '@/utils/normalizers.ts';

import type { Account, EmbeddedEntity } from '@/types/entities.ts';

export interface Chat {
  account: EmbeddedEntity<Account>;
  id: string;
  unread: number;
  last_message: string | null;
  updated_at: string;
}

export const normalizeChat = (chat: Record<string, any>): Chat => {
  return fromDefaults<Chat>({
    account: null,
    id: '',
    unread: 0,
    last_message: '',
    updated_at: '',
  }, chat);
};
