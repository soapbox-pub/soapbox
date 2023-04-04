import { useState } from 'react';

function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);

  function setPromise<T>(promise: Promise<T>) {
    setIsLoading(true);

    promise
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));

    return promise;
  }

  return [isLoading, setPromise] as const;
}

export { useLoading };