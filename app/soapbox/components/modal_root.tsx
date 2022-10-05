import classNames from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'wicg-inert';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { cancelReplyCompose } from 'soapbox/actions/compose';
import { openModal, closeModal } from 'soapbox/actions/modals';
import { useAppDispatch, useAppSelector, usePrevious } from 'soapbox/hooks';

import type { UnregisterCallback } from 'history';
import type { ReducerCompose } from 'soapbox/reducers/compose';

const messages = defineMessages({
  confirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
});

export const checkComposeContent = (compose?: ReturnType<typeof ReducerCompose>) => {
  return !!compose && [
    compose.text.length > 0,
    compose.spoiler_text.length > 0,
    compose.media_attachments.size > 0,
    compose.poll !== null,
  ].some(check => check === true);
};

interface IModalRoot {
  onCancel?: () => void,
  onClose: (type?: string) => void,
  type: string,
}

const ModalRoot: React.FC<IModalRoot> = ({ children, onCancel, onClose, type }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [revealed, setRevealed] = useState(!!children);

  const ref = useRef<HTMLDivElement>(null);
  const activeElement = useRef<HTMLDivElement | null>(revealed ? document.activeElement as HTMLDivElement | null : null);
  const modalHistoryKey = useRef<number>();
  const unlistenHistory = useRef<UnregisterCallback>();

  const prevChildren = usePrevious(children);
  const prevType = usePrevious(type);

  const isEditing = useAppSelector(state => state.compose.get('compose-modal')?.id !== null);

  const handleKeyUp = useCallback((e) => {
    if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)
      && !!children) {
      handleOnClose();
    }
  }, []);

  const handleOnClose = () => {
    dispatch((_, getState) => {
      const hasComposeContent = checkComposeContent(getState().compose.get('compose-modal'));

      if (hasComposeContent && type === 'COMPOSE') {
        dispatch(openModal('CONFIRM', {
          icon: require('@tabler/icons/trash.svg'),
          heading: isEditing ? <FormattedMessage id='confirmations.cancel_editing.heading' defaultMessage='Cancel post editing' /> : <FormattedMessage id='confirmations.delete.heading' defaultMessage='Delete post' />,
          message: isEditing ? <FormattedMessage id='confirmations.cancel_editing.message' defaultMessage='Are you sure you want to cancel editing this post? All changes will be lost.' /> : <FormattedMessage id='confirmations.delete.message' defaultMessage='Are you sure you want to delete this post?' />,
          confirm: intl.formatMessage(messages.confirm),
          onConfirm: () => {
            dispatch(closeModal('COMPOSE'));
            dispatch(cancelReplyCompose());
          },
          onCancel: () => {
            dispatch(closeModal('CONFIRM'));
          },
        }));
      } else if (hasComposeContent && type === 'CONFIRM') {
        dispatch(closeModal('CONFIRM'));
      } else {
        onClose();
      }
    });
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(ref.current!.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((x) => window.getComputedStyle(x).display !== 'none');
      const index = focusable.indexOf(e.target);

      let element;

      if (e.shiftKey) {
        element = focusable[index - 1] || focusable[focusable.length - 1];
      } else {
        element = focusable[index + 1] || focusable[0];
      }

      if (element) {
        (element as HTMLDivElement).focus();
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, []);

  const handleModalOpen = () => {
    modalHistoryKey.current = Date.now();
    unlistenHistory.current = history.listen((_, action) => {
      if (action === 'POP') {
        handleOnClose();

        if (onCancel) onCancel();
      }
    });
  };

  const handleModalClose = (type: string) => {
    if (unlistenHistory.current) {
      unlistenHistory.current();
    }
    if (!['FAVOURITES', 'MENTIONS', 'REACTIONS', 'REBLOGS', 'MEDIA'].includes(type)) {
      const { state } = history.location;
      if (state && (state as any).soapboxModalKey === modalHistoryKey.current) {
        history.goBack();
      }
    }
  };

  const ensureHistoryBuffer = () => {
    const { pathname, state } = history.location;
    if (!state || (state as any).soapboxModalKey !== modalHistoryKey.current) {
      history.push(pathname, { ...(state as any), soapboxModalKey: modalHistoryKey.current });
    }
  };

  const getSiblings = () => {
    return Array(...(ref.current!.parentElement!.childNodes as any as ChildNode[])).filter(node => node !== ref.current);
  };

  useEffect(() => {
    window.addEventListener('keyup', handleKeyUp, false);
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!!children && !prevChildren) {
      activeElement.current = document.activeElement as HTMLDivElement;
      getSiblings().forEach(sibling => (sibling as HTMLDivElement).setAttribute('inert', 'true'));

      handleModalOpen();
    } else if (!prevChildren) {
      setRevealed(false);
    }

    if (!children && !!prevChildren) {
      activeElement.current?.focus();
      activeElement.current = null;
      getSiblings().forEach(sibling => (sibling as HTMLDivElement).removeAttribute('inert'));

      handleModalClose(prevType!);
    }

    if (children) {
      requestAnimationFrame(() => {
        setRevealed(true);
      });

      ensureHistoryBuffer();
    }
  });

  const visible = !!children;

  if (!visible) {
    return (
      <div className='z-50 transition-all' ref={ref} style={{ opacity: 0 }} />
    );
  }

  return (
    <div
      ref={ref}
      className={classNames({
        'fixed top-0 left-0 z-[100] w-full h-full overflow-x-hidden overflow-y-auto': true,
        'pointer-events-none': !visible,
      })}
      style={{ opacity: revealed ? 1 : 0 }}
    >
      <div
        role='presentation'
        id='modal-overlay'
        className='fixed inset-0 bg-gray-500/90 dark:bg-gray-700/90'
        onClick={handleOnClose}
      />

      <div
        role='dialog'
        className={classNames({
          'my-2 mx-auto relative pointer-events-none flex items-center': true,
          'p-4 md:p-0': type !== 'MEDIA',
        })}
        style={{ minHeight: 'calc(100% - 3.5rem)' }}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalRoot;
