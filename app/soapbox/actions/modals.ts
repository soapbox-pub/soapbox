import type { ModalType } from 'soapbox/features/ui/components/modal-root';

const MODAL_OPEN  = 'MODAL_OPEN';
const MODAL_CLOSE = 'MODAL_CLOSE';

/** Open a modal of the given type */
const openModal = (type: ModalType, props?: any) => ({
  type: MODAL_OPEN,
  modalType: type,
  modalProps: props,
});

/** Close the modal */
const closeModal = (type?: ModalType) => ({
  type: MODAL_CLOSE,
  modalType: type,
});

export {
  MODAL_OPEN,
  MODAL_CLOSE,
  openModal,
  closeModal,
};
