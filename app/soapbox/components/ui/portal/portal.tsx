import React, { useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface IPortal {
  children: React.ReactNode
}

/**
 * Portal
 */
const Portal: React.FC<IPortal> = ({ children }) => {
  const isRendered = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (isRendered.current) {
      return;
    }

    isRendered.current = true;
  }, [isRendered.current]);

  if (!isRendered.current) {
    return null;
  }

  return (
    ReactDOM.createPortal(
      children,
      document.getElementById('soapbox') as HTMLDivElement,
    )
  );
};

export default Portal;