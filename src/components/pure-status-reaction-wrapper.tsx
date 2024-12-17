import { useState, useEffect, useRef, cloneElement } from 'react';

import { simpleEmojiReact } from 'soapbox/actions/emoji-reacts.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import EmojiSelector from 'soapbox/components/ui/emoji-selector.tsx';
import Portal from 'soapbox/components/ui/portal.tsx';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { selectEntity } from 'soapbox/entity-store/selectors.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { userTouching } from 'soapbox/is-mobile.ts';
import { normalizeStatus } from 'soapbox/normalizers/index.ts';
import { Status as StatusEntity } from 'soapbox/schemas/index.ts';

import type { Status as LegacyStatus } from 'soapbox/types/entities.ts';

interface IPureStatusReactionWrapper {
  statusId: string;
  children: JSX.Element;
}

/** Provides emoji reaction functionality to the underlying button component */
const PureStatusReactionWrapper: React.FC<IPureStatusReactionWrapper> = ({ statusId, children }): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const { account: ownAccount } = useOwnAccount();
  const getState = useGetState();

  const status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);

  const timeout = useRef<NodeJS.Timeout>();
  const [visible, setVisible] = useState(false);

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

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

    if (!userTouching.matches) {
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    // Unless the user is touching, delay closing the emoji selector briefly
    // so the user can move the mouse diagonally to make a selection.
    if (userTouching.matches) {
      setVisible(false);
    } else {
      timeout.current = setTimeout(() => {
        setVisible(false);
      }, 500);
    }
  };

  const handleReact = (emoji: string, custom?: string): void => {
    if (ownAccount) {
      dispatch(simpleEmojiReact(normalizeStatus(status) as LegacyStatus, emoji, custom));
    } else {
      handleUnauthorized();
    }

    setVisible(false);
  };

  const handleClick: React.EventHandler<React.MouseEvent> = e => {
    const meEmojiReact = status.reactions?.find((emojiReact) => emojiReact.me)?.name ?? '👍' ; // allow all emojis

    if (userTouching.matches) {
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

  return (
    <div className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {cloneElement(children, {
        onClick: handleClick,
        ref: setReferenceElement,
      })}

      {visible && (
        <Portal>
          <EmojiSelector
            placement='top-start'
            referenceElement={referenceElement}
            onReact={handleReact}
            visible={visible}
            onClose={() => setVisible(false)}
          />
        </Portal>
      )}
    </div>
  );
};

export default PureStatusReactionWrapper;
