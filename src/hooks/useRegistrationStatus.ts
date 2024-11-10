import { useFeatures } from './useFeatures.ts';
import { useInstance } from './useInstance.ts';

export const useRegistrationStatus = () => {
  const { instance } = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open. */
    isOpen: features.accountCreation && instance.registrations.enabled,
  };
};