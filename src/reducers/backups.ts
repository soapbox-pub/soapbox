import {
  BACKUPS_FETCH_SUCCESS,
  BACKUPS_CREATE_SUCCESS,
} from '../actions/backups.ts';
import { fromDefaults } from '../utils/normalizers.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

export interface Backup {
  id: number | null;
  content_type: string;
  url: string;
  file_size: number | null;
  processed: boolean;
  inserted_at: string;
}

type State = Record<string, Backup>;

const initialState: State = {};

const normalizeBackup = (backup: APIEntity): Backup => fromDefaults<Backup>({
  id: null,
  content_type: '',
  url: '',
  file_size: null,
  processed: false,
  inserted_at: '',
}, backup);

const importBackups = (state: State, backups: APIEntity[]): State => {
  const result = { ...state };

  backups.forEach(backup => {
    result[backup.inserted_at] = normalizeBackup(backup);
  });

  return result;
};

export default function backups(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case BACKUPS_FETCH_SUCCESS:
    case BACKUPS_CREATE_SUCCESS:
      return importBackups(state, action.backups);
    default:
      return state;
  }
}
