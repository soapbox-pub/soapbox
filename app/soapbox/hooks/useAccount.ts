import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

export const useAccount = (id: string) => {
  const getAccount = makeGetAccount();

  return useAppSelector((state) => getAccount(state, id));
};
