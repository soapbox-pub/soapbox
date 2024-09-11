import { useState, useEffect } from 'react';

import { useApi } from 'soapbox/hooks';
import { type ZapSplitData } from 'soapbox/schemas/zap-split';

import type { Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities';

type SplitValue = {
  id: string;
  amountSplit: number;
};

const useZapSplit = (status: StatusEntity | undefined, account: AccountEntity) => {
  const api = useApi();
  const [zapArrays, setZapArrays] = useState<ZapSplitData[]>([]);
  const [zapSplitData, setZapSplitData] = useState({ splitAmount: 3, receiveAmount: 47,
    splitValues: Array() });

  const fetchZapSplit = async (id: string) => {
    return await api.get(`/api/v1/ditto/${id}/zap_splits`);
  };

  const loadZapSplitData = async () => {
    if (status) {
      const data = (await fetchZapSplit(status.id)).data;
      setZapArrays(data);
    }
  };

  const receiveAmount = (zapAmount: number) => {
    if (zapArrays.length > 0) {
      const zapAmountPrincipal = zapArrays.find((zapSplit: ZapSplitData) => zapSplit.account.id === account.id);
      const zapAmountOthers = zapArrays.filter((zapSplit: ZapSplitData) => zapSplit.account.id !== account.id);

      const totalWeightSplit = zapAmountOthers.reduce((e: number, b: ZapSplitData) => e + b.weight, 0);
      const totalWeight = zapArrays.reduce((e: number, b: ZapSplitData) => e + b.weight, 0);

      if (zapAmountPrincipal) {
        const receiveZapAmount = Math.floor(zapAmountPrincipal.weight * (zapAmount / totalWeight));
        const splitResult = zapAmount - receiveZapAmount;

        let totalRoundedSplit = 0;
        const values = zapAmountOthers.map((zapData) => {
          const result = Math.floor(zapData.weight * (splitResult / totalWeightSplit));
          totalRoundedSplit += result;
          return { id: zapData.account.id, amountSplit: result };
        });

        const difference = splitResult - totalRoundedSplit;

        if (difference !== 0 && values.length > 0) {
          values[values.length - 1].amountSplit += difference;
        }

        if (zapSplitData.receiveAmount !== receiveZapAmount || zapSplitData.splitAmount !== splitResult) {
          setZapSplitData({ splitAmount: splitResult, receiveAmount: receiveZapAmount, splitValues: values });
        }
      }
    }
  };

  useEffect(() => {
    loadZapSplitData();
  }, [status]);

  return { zapArrays, zapSplitData, receiveAmount };
};

export default useZapSplit;
export { SplitValue };