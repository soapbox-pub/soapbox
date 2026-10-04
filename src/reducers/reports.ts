import {
  REPORT_INIT,
  REPORT_SUBMIT_REQUEST,
  REPORT_SUBMIT_SUCCESS,
  REPORT_SUBMIT_FAIL,
  REPORT_CANCEL,
  REPORT_STATUS_TOGGLE,
  REPORT_COMMENT_CHANGE,
  REPORT_FORWARD_CHANGE,
  REPORT_BLOCK_CHANGE,
  REPORT_RULE_CHANGE,
  ReportableEntities,
} from '../actions/reports.ts';

import type { ChatMessage, Group } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface NewReport {
  isSubmitting: boolean;
  entityType: ReportableEntities;
  account_id: string | null;
  status_ids: string[];
  chat_message: null | ChatMessage;
  group: null | Group;
  comment: string;
  forward: boolean;
  block: boolean;
  rule_ids: string[];
}

interface State {
  new: NewReport;
}

const initialState: State = {
  new: {
    isSubmitting: false,
    entityType: '' as ReportableEntities,
    account_id: null,
    status_ids: [],
    chat_message: null,
    group: null,
    comment: '',
    forward: false,
    block: false,
    rule_ids: [],
  },
};

const addToSet = (set: string[], value: string): string[] => set.includes(value) ? set : [...set, value];
const removeFromSet = (set: string[], value: string): string[] => set.filter(item => item !== value);

const updateNew = (state: State, changes: Partial<NewReport>): State => ({
  ...state,
  new: { ...state.new, ...changes },
});

export default function reports(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case REPORT_INIT: {
      const changes: Partial<NewReport> = {
        isSubmitting: false,
        account_id: action.account.id,
        entityType: action.entityType,
      };

      if (action.chatMessage) {
        changes.chat_message = action.chatMessage;
      }

      if (action.group) {
        changes.group = action.group;
      }

      if (state.new.account_id !== action.account.id) {
        changes.status_ids = action.status ? [action.status.reblog?.id || action.status.id] : [];
        changes.comment = '';
      } else if (action.status) {
        changes.status_ids = addToSet(state.new.status_ids, action.status.reblog?.id || action.status.id);
      }

      return updateNew(state, changes);
    }
    case REPORT_STATUS_TOGGLE:
      return updateNew(state, {
        status_ids: action.checked
          ? addToSet(state.new.status_ids, action.statusId)
          : removeFromSet(state.new.status_ids, action.statusId),
      });
    case REPORT_COMMENT_CHANGE:
      return updateNew(state, { comment: action.comment });
    case REPORT_FORWARD_CHANGE:
      return updateNew(state, { forward: action.forward });
    case REPORT_BLOCK_CHANGE:
      return updateNew(state, { block: action.block });
    case REPORT_RULE_CHANGE:
      return updateNew(state, {
        rule_ids: state.new.rule_ids.includes(action.rule_id)
          ? removeFromSet(state.new.rule_ids, action.rule_id)
          : addToSet(state.new.rule_ids, action.rule_id),
      });
    case REPORT_SUBMIT_REQUEST:
      return updateNew(state, { isSubmitting: true });
    case REPORT_SUBMIT_FAIL:
      return updateNew(state, { isSubmitting: false });
    case REPORT_CANCEL:
    case REPORT_SUBMIT_SUCCESS:
      return updateNew(state, {
        account_id: null,
        status_ids: [],
        chat_message: null,
        comment: '',
        isSubmitting: false,
        rule_ids: [],
        block: false,
      });
    default:
      return state;
  }
}
