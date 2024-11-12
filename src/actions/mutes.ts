import { openModal } from './modals.ts';

import type { Account } from 'soapbox/schemas/index.ts';
import type { AppDispatch } from 'soapbox/store.ts';
import type { Account as AccountEntity } from 'soapbox/types/entities.ts';

const MUTES_INIT_MODAL = 'MUTES_INIT_MODAL';
const MUTES_TOGGLE_HIDE_NOTIFICATIONS = 'MUTES_TOGGLE_HIDE_NOTIFICATIONS';
const MUTES_CHANGE_DURATION = 'MUTES_CHANGE_DURATION';

const initMuteModal = (account: AccountEntity | Account) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: MUTES_INIT_MODAL,
      account,
    });

    dispatch(openModal('MUTE'));
  };

const toggleHideNotifications = () =>
  (dispatch: AppDispatch) => {
    dispatch({ type: MUTES_TOGGLE_HIDE_NOTIFICATIONS });
  };

const changeMuteDuration = (duration: number) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: MUTES_CHANGE_DURATION,
      duration,
    });
  };

export {
  MUTES_INIT_MODAL,
  MUTES_TOGGLE_HIDE_NOTIFICATIONS,
  MUTES_CHANGE_DURATION,
  initMuteModal,
  toggleHideNotifications,
  changeMuteDuration,
};
