import { debounce } from 'lodash';
import { useEffect, useState } from 'react';

const useDebouncedWindowSize = (delay: number = 200) => {
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = debounce(() => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    }, delay);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('reisze', handleResize);
  });

  return { height, width };
};

export { useDebouncedWindowSize };
