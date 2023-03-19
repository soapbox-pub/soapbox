import api from 'soapbox/api';

import { useGetState } from './useGetState';

/** Use stateful Axios client with auth from Redux. */
export const useApi = () => {
  const getState = useGetState();
  return api(getState);
};
