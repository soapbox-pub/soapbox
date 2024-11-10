import { useState, useEffect } from 'react';

import { useApi } from 'soapbox/hooks/index.ts';
import { baseZapAccountSchema, type ZapSplitData } from 'soapbox/schemas/zap-split.ts';

import type { Account as AccountEntity, Status as StatusEntity   } from 'soapbox/types/entities.ts';

interface SplitValue {
  id: string;
  amountSplit: number;
}

/**
* Custom hook to handle the logic for zap split calculations.
*
* This hook fetches zap split data from the server and calculates the amount to be received
* by the main account and the split amounts for other associated accounts.
*
* @param {StatusEntity | undefined} status - The current status entity.
* @param {AccountEntity} account - The account for which the zap split calculation is done.
*
* @returns {Object} An object containing the zap split arrays, zap split data, and a function to calculate the received amount.
*
* @property {ZapSplitData[]} zapArrays - Array of zap split data returned from the API.
* @property {Object} zapSplitData - Contains the total split amount, amount to receive, and individual split values.
* @property {Function} receiveAmount - A function to calculate the zap amount based on the split configuration.
*/
const useZapSplit = (status: StatusEntity | undefined, account: AccountEntity) => {
  const api = useApi();
  const [zapArrays, setZapArrays] = useState<ZapSplitData[]>([]);
  const [zapSplitData, setZapSplitData] = useState<{splitAmount: number; receiveAmount: number; splitValues: SplitValue[]}>({ splitAmount: Number(), receiveAmount: Number(), splitValues: [] });

  const fetchZapSplit = (id: string) => api.get(`/api/v1/ditto/${id}/zap_splits`);

  const loadZapSplitData = async () => {
    if (status) {
      const response = await fetchZapSplit(status.id);
      const data: ZapSplitData[] = await response.json();
      if (data) {
        const normalizedData = data.map((dataSplit) => baseZapAccountSchema.parse(dataSplit));
        setZapArrays(normalizedData);
      }
    }
  };

  /**
   * Calculates and updates the zap amount that the main account will receive
   * and the split amounts for other accounts.
   *
   * @param {number} zapAmount - The total amount of zaps to be split.
   */
  const receiveAmount = (zapAmount: number) => {
    if (zapArrays.length > 0) {
      const zapAmountPrincipal = zapArrays.find((zapSplit: ZapSplitData) => zapSplit.account.id === account.id);
      const formattedZapAmountPrincipal = {
        account: zapAmountPrincipal?.account,
        message: zapAmountPrincipal?.message,
        weight: zapArrays.filter((zapSplit: ZapSplitData) => zapSplit.account.id === account.id).reduce((acc:number, zapData: ZapSplitData) => acc + zapData.weight, 0),
      };
      const zapAmountOthers = zapArrays.filter((zapSplit: ZapSplitData) => zapSplit.account.id !== account.id);

      const totalWeightSplit = zapAmountOthers.reduce((e: number, b: ZapSplitData) => e + b.weight, 0);
      const totalWeight = zapArrays.reduce((e: number, b: ZapSplitData) => e + b.weight, 0);

      if (zapAmountPrincipal) {
        const receiveZapAmount = Math.floor(formattedZapAmountPrincipal.weight * (zapAmount / totalWeight));
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
export type { SplitValue };