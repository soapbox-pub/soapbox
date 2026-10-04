import { connect } from 'react-redux';

import { cancelReplyCompose } from '@/actions/compose.ts';
import { cancelEventCompose } from '@/actions/events.ts';
import { closeModal } from '@/actions/modals.ts';
import { cancelReport } from '@/actions/reports.ts';

import ModalRoot, { ModalType } from '../components/modal-root.tsx';

import type { AppDispatch, RootState } from '@/store.ts';

const emptyProps = {};

const mapStateToProps = (state: RootState) => {
  const modal = state.modals.at(-1);

  return {
    type: (modal?.modalType ?? null) as ModalType,
    props: modal?.modalProps ?? emptyProps,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onClose(type?: ModalType) {
    switch (type) {
      case 'COMPOSE':
        dispatch(cancelReplyCompose());
        break;
      case 'COMPOSE_EVENT':
        dispatch(cancelEventCompose());
        break;
      case 'REPORT':
        dispatch(cancelReport());
        break;
      default:
        break;
    }

    dispatch(closeModal(type));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalRoot);
