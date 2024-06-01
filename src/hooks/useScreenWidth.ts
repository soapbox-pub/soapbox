import { useState, useEffect } from 'react';

export function useScreenWidth() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const checkWindowSize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', checkWindowSize);

    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);

  return screenWidth;
}