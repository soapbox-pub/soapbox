import { useFeatures } from './useFeatures';
import { useInstance } from './useInstance';

export const useRegistrationStatus = () => {
  const instance = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open, either through Pepe or traditional account creation. */
    isOpen: features.accountCreation && instance.registrations,
  };
};