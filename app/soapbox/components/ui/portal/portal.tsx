import React, { useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface IPortal {
  children: React.ReactNode
}

/**
 * Portal
 */
const Portal: React.FC<IPortal> = ({ children }) => {
  const [isRendered, setIsRendered] = useState<boolean>(false);

  useLayoutEffect(() => {
    setIsRendered(true);
  }, []);


  if (!isRendered) {
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