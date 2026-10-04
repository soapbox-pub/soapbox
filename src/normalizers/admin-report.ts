/**
 * Admin report normalizer:
 * Converts API admin-level report information into our internal format.
 */
import { fromDefaults } from '@/utils/normalizers.ts';

import type { Account, EmbeddedEntity, Status } from '@/types/entities.ts';

export interface AdminReport {
  account: EmbeddedEntity<Account>;
  action_taken: boolean;
  action_taken_by_account: EmbeddedEntity<Account> | null;
  assigned_account: EmbeddedEntity<Account> | null;
  category: string;
  comment: string;
  created_at: Date | string;
  id: string;
  rules: string[];
  statuses: EmbeddedEntity<Status>[];
  target_account: EmbeddedEntity<Account>;
  updated_at: Date | string;
}

const normalizePleromaReport = (report: Record<string, any>): Record<string, any> => {
  if (report.actor) {
    return {
      ...report,
      target_account: report.account,
      account: report.actor,
      action_taken: report.state !== 'open',
      comment: report.content,
      updated_at: report.created_at,
    };
  }

  return report;
};

export const normalizeAdminReport = (report: Record<string, any>): AdminReport => {
  return fromDefaults<AdminReport>({
    account: null,
    action_taken: false,
    action_taken_by_account: null,
    assigned_account: null,
    category: '',
    comment: '',
    created_at: new Date(),
    id: '',
    rules: [],
    statuses: [],
    target_account: null,
    updated_at: new Date(),
  }, normalizePleromaReport(report));
};
