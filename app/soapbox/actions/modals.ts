import { AppDispatch } from 'soapbox/store';

import type { ModalType } from 'soapbox/features/ui/components/modal-root';

export const MODAL_OPEN  = 'MODAL_OPEN';
export const MODAL_CLOSE = 'MODAL_CLOSE';

/** Open a modal of the given type */
export function openModal(type: ModalType, props?: any) {
  return (dispatch: AppDispatch) => {
    dispatch(closeModal(type));
    dispatch(openModalSuccess(type, props));
  };
}

const openModalSuccess = (type: ModalType, props?: any) => ({
  type: MODAL_OPEN,
  modalType: type,
  modalProps: props,
});

/** Close the modal */
export function closeModal(type?: ModalType) {
  return {
    type: MODAL_CLOSE,
    modalType: type,
  };
}
