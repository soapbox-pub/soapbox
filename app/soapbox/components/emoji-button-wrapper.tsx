import classNames from 'clsx';
import React, { useState, useEffect, useRef } from 'react';
import { usePopper } from 'react-popper';

import { simpleEmojiReact } from 'soapbox/actions/emoji-reacts';
import { openModal } from 'soapbox/actions/modals';
import { EmojiSelector } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useOwnAccount, useSoapboxConfig } from 'soapbox/hooks';
import { isUserTouching } from 'soapbox/is-mobile';
import { getReactForStatus } from 'soapbox/utils/emoji-reacts';

interface IEmojiButtonWrapper {
  statusId: string,
  children: JSX.Element,
}

/** Provides emoji reaction functionality to the underlying button component */
const EmojiButtonWrapper: React.FC<IEmojiButtonWrapper> = ({ statusId, children }): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const ownAccount = useOwnAccount();
  const status = useAppSelector(state => state.statuses.get(statusId));
  const soapboxConfig = useSoapboxConfig();

  const timeout = useRef<NodeJS.Timeout>();
  const [visible, setVisible] = useState(false);
  // const [focused, setFocused] = useState(false);

  // `useRef` won't trigger a re-render, while `useState` does.
  // https://popper.js.org/react-popper/v2/
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-10, 0],
        },
      },
    ],
  });

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  if (!status) return null;

  const handleMouseEnter = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (!isUserTouching()) {
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    // Unless the user is touching, delay closing the emoji selector briefly
    // so the user can move the mouse diagonally to make a selection.
    if (isUserTouching()) {
      setVisible(false);
    } else {
      timeout.current = setTimeout(() => {
        setVisible(false);
      }, 500);
    }
  };

  const handleReact = (emoji: string): void => {
    if (ownAccount) {
      dispatch(simpleEmojiReact(status, emoji));
    } else {
      handleUnauthorized();
    }

    setVisible(false);
  };

  const handleClick: React.EventHandler<React.MouseEvent> = e => {
    const meEmojiReact = getReactForStatus(status, soapboxConfig.allowedEmoji) || '👍';

    if (isUserTouching()) {
      if (ownAccount) {
        if (visible) {
          handleReact(meEmojiReact);
        } else {
          setVisible(true);
        }
      } else {
        handleUnauthorized();
      }
    } else {
      handleReact(meEmojiReact);
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const handleUnauthorized = () => {
    dispatch(openModal('UNAUTHORIZED', {
      action: 'FAVOURITE',
      ap_id: status.url,
    }));
  };

  // const handleUnfocus: React.EventHandler<React.KeyboardEvent> = () => {
  //   setFocused(false);
  // };

  const selector = (
    <div
      className={classNames('z-50 transition-opacity duration-100', {
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      <EmojiSelector
        emojis={soapboxConfig.allowedEmoji}
        onReact={handleReact}
        // focused={focused}
        // onUnfocus={handleUnfocus}
      />
    </div>
  );

  return (
    <div className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {React.cloneElement(children, {
        onClick: handleClick,
        ref: setReferenceElement,
      })}

      {selector}
    </div>
  );
};

export default EmojiButtonWrapper;
