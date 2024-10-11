import { useAppSelector } from './useAppSelector';

/** Get the Instance for the current backend. */
export const useInstance = () => {
  const instance = useAppSelector((state) => state.instance);
  return { instance };
};
