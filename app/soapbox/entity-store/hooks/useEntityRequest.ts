import { useApi, useLoading } from 'soapbox/hooks';

import { EntityRequest } from './types';
import { toAxiosRequest } from './utils';

function useEntityRequest() {
  const api = useApi();
  const [isLoading, setPromise] = useLoading();

  function request(entityRequest: EntityRequest) {
    const req = api.request(toAxiosRequest(entityRequest));
    return setPromise(req);
  }

  return {
    request,
    isLoading,
  };
}

export { useEntityRequest };