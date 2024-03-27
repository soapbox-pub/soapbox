import { useState, useCallback } from 'react';

export function useForceUpdate(): () => void {
  const [, setState] = useState(false);

  const forceUpdate = useCallback(() => {
    setState(prevState => !prevState);
  }, []);

  return forceUpdate;
}
