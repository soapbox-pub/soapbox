import { useState } from 'react';

function useLoading() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

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