import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi';
import { useFeatures } from 'soapbox/hooks/useFeatures';

type Validation = {
  error: string
  message: string
}

const ValidationKeys = {
  validation: (name: string) => ['group', 'validation', name] as const,
};

function useGroupValidation(name: string = '') {
  const api = useApi();
  const features = useFeatures();

  const getValidation = async() => {
    const { data } = await api.get<Validation>('/api/v1/groups/validate', {
      params: { name },
    })
      .catch((error) => {
        if (error.response.status === 422) {
          return { data: error.response.data };
        }

        throw error;
      });

    return data;
  };

  const queryInfo = useQuery<Validation>(ValidationKeys.validation(name), getValidation, {
    enabled: features.groupsValidation && !!name,
  });

  return {
    ...queryInfo,
    data: {
      ...queryInfo.data,
      isValid: !queryInfo.data?.error ?? true,
    },
  };
}

export { useGroupValidation };