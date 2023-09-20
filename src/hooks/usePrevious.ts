import { useRef, useEffect } from 'react';

/** Get the last version of this value. */
// https://usehooks.com/usePrevious/
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};