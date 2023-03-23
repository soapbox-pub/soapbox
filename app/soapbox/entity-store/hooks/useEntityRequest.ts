import { useState } from 'react';

import { useApi } from 'soapbox/hooks';

import { EntityRequest } from './types';
import { toAxiosRequest } from './utils';

function useEntityRequest() {
  const api = useApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function request(entityRequest: EntityRequest) {
    setIsLoading(true);
    try {
      const response = await api.request(toAxiosRequest(entityRequest));
      setIsLoading(false);
      return response;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  }

  return {
    request,
    isLoading,
  };
}

export { useEntityRequest };