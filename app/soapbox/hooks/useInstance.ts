import { useAppSelector } from 'soapbox/hooks';

/** Get the Instance for the current backend. */
export const useInstance = () => {
  return useAppSelector((state) => state.instance);
};
