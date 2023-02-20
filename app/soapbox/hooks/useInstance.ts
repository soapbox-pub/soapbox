import { useAppSelector } from 'soapbox/hooks';

/** Get the Instance for the current backend. */
export const useInstance = () => useAppSelector((state) => state.instance);
