import { debounce } from 'es-toolkit';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';

import {
  openStatusHoverCard,
  closeStatusHoverCard,
} from 'soapbox/actions/status-hover-card.ts';
import { isMobile } from 'soapbox/is-mobile.ts';

const showStatusHoverCard = debounce((dispatch, ref, statusId) => {
  dispatch(openStatusHoverCard(ref, statusId));
}, 300);

interface IHoverStatusWrapper {
  statusId: any;
  inline: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Makes a status hover card appear when the wrapped element is hovered. */
export const HoverStatusWrapper: React.FC<IHoverStatusWrapper> = ({ statusId, children, inline = false, className }) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const Elem: keyof JSX.IntrinsicElements = inline ? 'span' : 'div';

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      showStatusHoverCard(dispatch, ref, statusId);
    }
  };

  const handleMouseLeave = () => {
    showStatusHoverCard.cancel();
    setTimeout(() => dispatch(closeStatusHoverCard()), 200);
  };

  const handleClick = () => {
    showStatusHoverCard.cancel();
    dispatch(closeStatusHoverCard(true));
  };

  return (
    <Elem
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </Elem>
  );
};

export { HoverStatusWrapper as default, showStatusHoverCard };
