import { useState, useEffect } from 'react';

import { useApi } from 'soapbox/hooks';
import { baseZapAccountSchema, ZapSplitData } from 'soapbox/schemas/zap-split';

import { type INewAccount } from '../../../features/admin/manage-zap-split';

export const useManageZapSplit = () => {
  const api = useApi();
  const [formattedData, setFormattedData] = useState<ZapSplitData[]>([]);
  const [weights, setWeights] = useState<{ [id: string]: number }>({});

  const fetchZapSplitData = async () => {
    try {
      const { data } = await api.get<ZapSplitData[]>('/api/v1/ditto/zap_splits');
      if (data) {
        const normalizedData = data.map((dataSplit) => baseZapAccountSchema.parse(dataSplit));
        setFormattedData(normalizedData);

        const initialWeights = normalizedData.reduce((acc, item) => {
          acc[item.account.id] = item.weight;
          return acc;
        }, {} as { [id: string]: number });
        setWeights(initialWeights);
      }
    } catch (error) {
      console.error('Erro ao buscar Zap Split data:', error);
    }
  };

  useEffect(() => {
    fetchZapSplitData();
  }, []);

  const handleWeightChange = (accountId: string, newWeight: number) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [accountId]: newWeight,
    }));
  };

  const sendNewSplit = async (newAccount?: INewAccount) => {
    try {
      const updatedZapSplits = formattedData.reduce((acc: { [id: string]: { message: string; weight: number } }, zapData) => {
        acc[zapData.account.id] = {
          message: zapData.message,
          weight: weights[zapData.account.id] || zapData.weight,
        };
        return acc;
      }, {});

      if (newAccount) {
        updatedZapSplits[newAccount.acc] = {
          message: newAccount.message,
          weight: newAccount.weight,
        };
      }

      console.log('Enviando Zap Split data com nova conta (se houver):', updatedZapSplits);

      await api.put('/api/v1/admin/ditto/zap_splits', updatedZapSplits);

      console.log('Dados enviados com sucesso:', updatedZapSplits);

      await fetchZapSplitData();
    } catch (error) {
      console.error('Erro ao enviar Zap Split data:', error);
    }
  };

  const removeAccount = async (accountId: string) => {
    const isToDelete = [(formattedData.find(item => item.account.id === accountId))?.account.id];

    await api.delete('/api/v1/admin/ditto/zap_splits/', { data: isToDelete });
    await fetchZapSplitData();
  };


  return {
    formattedData,
    weights,
    handleWeightChange,
    sendNewSplit,
    removeAccount,
  };
};