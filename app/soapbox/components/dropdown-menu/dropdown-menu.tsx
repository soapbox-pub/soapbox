import { offset, Placement, useFloating, flip, arrow } from '@floating-ui/react';
import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  closeDropdownMenu as closeDropdownMenuRedux,
  openDropdownMenu,
} from 'soapbox/actions/dropdown-menu';
import { closeModal, openModal } from 'soapbox/actions/modals';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { isUserTouching } from 'soapbox/is-mobile';

import { IconButton, Portal } from '../ui';

import DropdownMenuItem, { MenuItem } from './dropdown-menu-item';

import type { Status } from 'soapbox/types/entities';

export type Menu = Array<MenuItem | null>;

interface IDropdownMenu {
  children?: React.ReactElement
  disabled?: boolean
  items: Menu
  onClose?: () => void
  onOpen?: () => void
  onShiftClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>
  placement?: Placement
  src?: string
  status?: Status
  title?: string
}

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const DropdownMenu = (props: IDropdownMenu) => {
  const {
    children,
    disabled,
    items,
    onClose,
    onOpen,
    onShiftClick,
    placement: initialPlacement = 'top',
    src = require('@tabler/icons/dots.svg'),
    title = 'Menu',
    ...filteredProps
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isOpenRedux = useAppSelector(state => state.dropdown_menu.isOpen);

  const arrowRef = useRef<HTMLDivElement>(null);
  const activeElement = useRef<Element | null>(null);

  const isOnMobile = isUserTouching();

  const { x, y, strategy, refs, middlewareData, placement } = useFloating<HTMLButtonElement>({
    placement: initialPlacement,
    middleware: [
      offset(12),
      flip(),
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const handleClick: React.EventHandler<
    React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  > = (event) => {
    event.stopPropagation();

    if (onShiftClick && event.shiftKey) {
      event.preventDefault();

      onShiftClick(event);
      return;
    }

    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  /**
   * On mobile screens, let's replace the Popper dropdown with a Modal.
   */
  const handleOpen = () => {
    if (isOnMobile) {
      dispatch(
        openModal('ACTIONS', {
          status: filteredProps.status,
          actions: items,
          onClick: handleItemClick,
        }),
      );
    } else {
      dispatch(openDropdownMenu());
      setIsOpen(true);
    }

    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    if (activeElement.current && activeElement.current === refs.reference.current) {
      (activeElement.current as any).focus();
      activeElement.current = null;
    }

    if (isOnMobile) {
      dispatch(closeModal('ACTIONS'));
    } else {
      closeDropdownMenu();
      setIsOpen(false);
    }

    if (onClose) {
      onClose();
    }
  };

  const closeDropdownMenu = () => {
    if (isOpenRedux) {
      dispatch(closeDropdownMenuRedux());
    }
  };

  const handleMouseDown: React.EventHandler<React.MouseEvent | React.KeyboardEvent> = () => {
    if (!isOpen) {
      activeElement.current = document.activeElement;
    }
  };

  const handleButtonKeyDown: React.EventHandler<React.KeyboardEvent> = (event) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        handleMouseDown(event);
        break;
    }
  };

  const handleKeyPress: React.EventHandler<React.KeyboardEvent<HTMLButtonElement>> = (event) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.stopPropagation();
        event.preventDefault();
        handleClick(event);
        break;
    }
  };

  const handleItemClick: React.EventHandler<React.MouseEvent> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const i = Number(event.currentTarget.getAttribute('data-index'));
    const item = items[i];
    if (!item) return;

    const { action, to } = item;

    handleClose();

    if (typeof action === 'function') {
      action(event);
    } else if (to) {
      history.push(to);
    }
  };

  const handleDocumentClick = (event: Event) => {
    if (refs.floating.current && !refs.floating.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!refs.floating.current) return;

    const items = Array.from(refs.floating.current.getElementsByTagName('a'));
    const index = items.indexOf(document.activeElement as any);

    let element = null;

    switch (e.key) {
      case 'ArrowDown':
        element = items[index + 1] || items[0];
        break;
      case 'ArrowUp':
        element = items[index - 1] || items[items.length - 1];
        break;
      case 'Tab':
        if (e.shiftKey) {
          element = items[index - 1] || items[items.length - 1];
        } else {
          element = items[index + 1] || items[0];
        }
        break;
      case 'Home':
        element = items[0];
        break;
      case 'End':
        element = items[items.length - 1];
        break;
      case 'Escape':
        handleClose();
        break;
    }

    if (element) {
      element.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const arrowProps: React.CSSProperties = useMemo(() => {
    if (middlewareData.arrow) {
      const { x, y } = middlewareData.arrow;

      const staticPlacement = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      return {
        left: x !== null ? `${x}px` : '',
        top: y !== null ? `${y}px` : '',
        // Ensure the static side gets unset when
        // flipping to other placements' axes.
        right: '',
        bottom: '',
        [staticPlacement as string]: `${(-(arrowRef.current?.offsetWidth || 0)) / 2}px`,
        transform: 'rotate(45deg)',
      };
    }

    return {};
  }, [middlewareData.arrow, placement]);

  useEffect(() => {
    return () => {
      closeDropdownMenu();
    };
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('touchend', handleDocumentClick, listenerOptions);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchend', handleDocumentClick);
    };
  }, [refs.floating.current]);

  return (
    <>
      {children ? (
        React.cloneElement(children, {
          disabled,
          onClick: handleClick,
          onMouseDown: handleMouseDown,
          onKeyDown: handleButtonKeyDown,
          onKeyPress: handleKeyPress,
          ref: refs.setReference,
        })
      ) : (
        <IconButton
          disabled={disabled}
          className={clsx({
            'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500': true,
            'text-gray-700 dark:text-gray-500': isOpen,
          })}
          title={title}
          src={src}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onKeyDown={handleButtonKeyDown}
          onKeyPress={handleKeyPress}
          ref={refs.setReference}
        />
      )}

      {isOpen ? (
        <Portal>
          <div
            data-testid='dropdown-menu'
            ref={refs.setFloating}
            className={
              clsx('z-[1001] w-56 rounded-md bg-white py-1 shadow-lg transition-opacity duration-100 focus:outline-none dark:bg-gray-900 dark:ring-2 dark:ring-primary-700', {
                'opacity-0 pointer-events-none': !isOpen,
              })
            }
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
          >
            <ul>
              {items.map((item, idx) => (
                <DropdownMenuItem
                  key={idx}
                  item={item}
                  index={idx}
                  onClick={handleClose}
                />
              ))}
            </ul>

            {/* Arrow */}
            <div
              ref={arrowRef}
              style={arrowProps}
              className='pointer-events-none absolute z-[-1] h-3 w-3 bg-white dark:bg-gray-900'
            />
          </div>
        </Portal>
      ) : null}
    </>
  );
};

export default DropdownMenu;