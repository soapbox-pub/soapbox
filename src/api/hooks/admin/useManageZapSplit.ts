import { useState, useEffect } from 'react';
import { defineMessages } from 'react-intl';

import { type INewAccount } from 'soapbox/features/admin/manage-zap-split';
import { useApi } from 'soapbox/hooks';
import { baseZapAccountSchema, ZapSplitData } from 'soapbox/schemas/zap-split';
import toast from 'soapbox/toast';


const messages = defineMessages({
  zapSplitFee: { id: 'manage.zap_split.fees_error_message', defaultMessage: 'The fees cannot exceed 50% of the total zap.' },
  fetchErrorMessage: { id: 'manage.zap_split.fetch_fail_request', defaultMessage: 'Failed to fetch Zap Split data.' },
  errorMessage: { id: 'manage.zap_split.fail_request', defaultMessage: 'Failed to update fees.' },
  sucessMessage: { id: 'manage.zap_split.success_request', defaultMessage: 'Fees updated successfully.' },
});

/**
* Custom hook that manages the logic for handling Zap Split data, including fetching, updating, and removing accounts.
* It handles the state for formatted data, weights, and messages associated with the Zap Split accounts.
*
* @returns An object with data, weights, message, and functions to manipulate them.
*/
export const useManageZapSplit = () => {
  const api = useApi();
  const [formattedData, setFormattedData] = useState<ZapSplitData[]>([]);
  const [weights, setWeights] = useState<{ [id: string]: number }>({});
  const [message, setMessage] = useState<{ [id: string]: string }>({});

  /**
  * Fetches the Zap Split data from the API, parses it, and sets the state for formatted data, weights, and messages.
  * Displays an error toast if the request fails.
  */
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

        const initialMessages = normalizedData.reduce((acc, item) => {
          acc[item.account.id] = item.message;
          return acc;
        }, {} as { [id: string]: string });
        setMessage(initialMessages);
      }
    } catch (error) {
      toast.error(messages.fetchErrorMessage);
    }
  };

  useEffect(() => {
    fetchZapSplitData();
  }, []);

  /**
  * Updates the weight of a specific account.
  *
  * @param accountId - The ID of the account whose weight is being changed.
  * @param newWeight - The new weight value to be assigned to the account.
  */
  const handleWeightChange = (accountId: string, newWeight: number) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [accountId]: newWeight,
    }));
  };

  /**
  * Updates the message of a specific account.
  *
  * @param accountId - The ID of the account whose weight is being changed.
  * @param newMessage - The new message to be assigned to the account.
  */
  const handleMessageChange = (accountId: string, newMessage: string) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [accountId]: newMessage,
    }));
  };

  /**
  * Sends the updated Zap Split data to the API, including any new account or message changes.
  * If the total weight exceeds 50%, displays an error toast and aborts the operation.
  *
  * @param newAccount - (Optional) A new account object to be added to the Zap Split data.
  */
  const sendNewSplit = async (newAccount?: INewAccount) => {
    try {
      const updatedZapSplits = formattedData.reduce((acc: { [id: string]: { message: string; weight: number } }, zapData) => {
        acc[zapData.account.id] = {
          message: message[zapData.account.id] || zapData.message,
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

      const totalWeight = Object.values(updatedZapSplits).reduce((acc, currentValue) => {
        return acc + currentValue.weight;
      }, 0);

      if (totalWeight > 50) {
        toast.error(messages.zapSplitFee);
        return;
      }

      await api.put('/api/v1/admin/ditto/zap_splits', updatedZapSplits);
    } catch (error) {
      toast.error(messages.errorMessage);
      return;
    }

    await fetchZapSplitData();
    toast.success(messages.sucessMessage);
  };

  /**
  * Removes an account from the Zap Split by making a DELETE request to the API, and then refetches the updated data.
  *
  * @param accountId - The ID of the account to be removed.
  */
  const removeAccount = async (accountId: string) => {
    const isToDelete = [(formattedData.find(item => item.account.id === accountId))?.account.id];

    await api.delete('/api/v1/admin/ditto/zap_splits/', { data: isToDelete });
    await fetchZapSplitData();
  };


  return {
    formattedData,
    weights,
    message,
    handleMessageChange,
    handleWeightChange,
    sendNewSplit,
    removeAccount,
  };
};