import { useFloating } from '@floating-ui/react';
import clsx from 'clsx';
import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import {
  closeStatusHoverCard,
  updateStatusHoverCard,
} from 'soapbox/actions/status-hover-card.ts';
import { fetchStatus } from 'soapbox/actions/statuses.ts';
import StatusContainer from 'soapbox/containers/status-container.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import { showStatusHoverCard } from './hover-status-wrapper.tsx';

interface IStatusHoverCard {
  visible?: boolean;
}

/** Popup status preview that appears when hovering reply to */
export const StatusHoverCard: React.FC<IStatusHoverCard> = ({ visible = true }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const statusId: string | undefined = useAppSelector(state => state.status_hover_card.statusId || undefined);
  const status = useAppSelector(state => state.statuses.get(statusId!));
  const targetRef = useAppSelector(state => state.status_hover_card.ref?.current);

  useEffect(() => {
    if (statusId && !status) {
      dispatch(fetchStatus(statusId));
    }
  }, [statusId, status]);

  useEffect(() => {
    const unlisten = history.listen(() => {
      showStatusHoverCard.cancel();
      dispatch(closeStatusHoverCard());
    });

    return () => {
      unlisten();
    };
  }, []);

  const { floatingStyles } = useFloating({
    placement: 'top',
    elements: {
      floating: popperElement,
      reference: targetRef,
    },
  });

  const handleMouseEnter = useCallback((): React.MouseEventHandler => {
    return () => {
      dispatch(updateStatusHoverCard());
    };
  }, []);

  const handleMouseLeave = useCallback((): React.MouseEventHandler => {
    return () => {
      dispatch(closeStatusHoverCard(true));
    };
  }, []);

  if (!status) return null;

  return (
    <div
      className={clsx({
        'absolute transition-opacity w-[500px] z-50 top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={floatingStyles}
      onMouseEnter={handleMouseEnter()}
      onMouseLeave={handleMouseLeave()}
    >
      <div className='overflow-hidden rounded-xl bg-white p-4 black:bg-black dark:bg-primary-900'>
        <StatusContainer id={status.id} hoverable={false} hideActionBar muted slim />
      </div>
    </div>
  );
};

export default StatusHoverCard;
