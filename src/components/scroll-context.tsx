import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface IScrollContext {
  children: React.ReactNode;
}

export const ScrollContext: React.FC<IScrollContext> = ({ children }) => {
  const location = useLocation<{ soapboxModalKey?: number } | undefined>();

  useEffect(() => {
    if (!location.state?.soapboxModalKey) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return children;
};