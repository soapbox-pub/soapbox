import React, { useEffect, useMemo, useState } from 'react';

/** Detect whether a given element is on the screen. */
// https://stackoverflow.com/a/64892655
export const useOnScreen = <T>(ref: React.RefObject<T & Element>) =>  {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(() => {
    return new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
    );
  }, []);

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  return isIntersecting;
};
