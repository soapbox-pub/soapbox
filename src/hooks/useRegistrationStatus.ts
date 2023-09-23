import { useFeatures } from './useFeatures';
import { useInstance } from './useInstance';

export const useRegistrationStatus = () => {
  const instance = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open. */
    isOpen: features.accountCreation && instance.registrations,
  };
};