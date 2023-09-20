import { ExtendedRefs } from '@floating-ui/react';
import { useCallback, useEffect } from 'react';

/** Trigger `callback` when a Floating UI element is clicked outside from. */
export const useClickOutside = <T extends HTMLElement>(
  refs: ExtendedRefs<T>,
  callback: (e: MouseEvent) => void,
) => {
  const handleWindowClick = useCallback((e: MouseEvent) => {
    if (e.target) {
      const target = e.target as Node;

      const floating = refs.floating.current;
      const reference = refs.reference.current as T | undefined;

      if (!(floating?.contains(target) || reference?.contains(target))) {
        callback(e);
      }
    }
  }, [refs.floating.current, refs.reference.current]);

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);
};