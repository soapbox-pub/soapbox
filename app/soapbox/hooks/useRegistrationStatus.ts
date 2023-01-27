import { useAppSelector } from './useAppSelector';
import { useFeatures } from './useFeatures';
import { useInstance } from './useInstance';
import { useSoapboxConfig } from './useSoapboxConfig';

export const useRegistrationStatus = () => {
  const instance = useInstance();
  const features = useFeatures();
  const soapboxConfig = useSoapboxConfig();

  const pepeOpen = useAppSelector(state => state.verification.instance.get('registrations') === true);
  const pepeEnabled = soapboxConfig.getIn(['extensions', 'pepe', 'enabled']) === true;

  return {
    /** Registrations are open, either through Pepe or traditional account creation. */
    isOpen: (features.accountCreation && instance.registrations) || (pepeEnabled && pepeOpen),
    /** Whether Pepe is open. */
    pepeOpen,
    /** Whether Pepe is enabled. */
    pepeEnabled,
  };
};