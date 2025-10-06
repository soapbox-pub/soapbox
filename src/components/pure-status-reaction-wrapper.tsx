import { useState, useEffect, useRef, cloneElement } from 'react';

import { openModal } from '@/actions/modals.ts';
import { useReaction } from '@/api/hooks/index.ts';
import EmojiSelector from '@/components/ui/emoji-selector.tsx';
import Portal from '@/components/ui/portal.tsx';
import { Entities } from '@/entity-store/entities.ts';
import { selectEntity } from '@/entity-store/selectors.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';
import { userTouching } from '@/is-mobile.ts';
import { Status as StatusEntity } from '@/schemas/index.ts';

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
  const { simpleEmojiReact } = useReaction();

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
      simpleEmojiReact(status, emoji);
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
