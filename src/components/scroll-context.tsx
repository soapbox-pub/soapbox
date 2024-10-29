import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { usePrevious } from 'soapbox/hooks';

export type Location<T> = ReturnType<typeof useLocation<T>>;

interface IScrollContext {
  shouldUpdateScroll(prevLocation: Location<any> | undefined, location: Location<any>): boolean;
  children: React.ReactNode;
}

export const ScrollContext: React.FC<IScrollContext> = ({ shouldUpdateScroll, children }) => {
  const location = useLocation();
  const prevLocation = usePrevious(location);

  useEffect(() => {
    if (prevLocation && (prevLocation.pathname !== location.pathname) && shouldUpdateScroll(prevLocation, location)) {
      window.scrollTo(0, 0);
    }
  }, [location, shouldUpdateScroll]);

  return children;
};