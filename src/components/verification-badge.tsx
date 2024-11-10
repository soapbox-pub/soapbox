import clsx from 'clsx';
import { useIntl, defineMessages } from 'react-intl';

import verifiedIcon from 'soapbox/assets/icons/verified.svg';
import Icon from 'soapbox/components/ui/icon.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';

const messages = defineMessages({
  verified: { id: 'account.verified', defaultMessage: 'Verified Account' },
});

interface IVerificationBadge {
  className?: string;
}

const VerificationBadge: React.FC<IVerificationBadge> = ({ className }) => {
  const intl = useIntl();
  const soapboxConfig = useSoapboxConfig();

  // Prefer a custom icon if found
  const icon = soapboxConfig.verifiedIcon || verifiedIcon;

  // Render component based on file extension
  const Element = icon.endsWith('.svg') ? Icon : 'img';

  return (
    <span className='verified-icon' data-testid='verified-badge'>
      <Element className={clsx('w-4 text-accent-500', className)} src={icon} alt={intl.formatMessage(messages.verified)} />
    </span>
  );
};

export default VerificationBadge;
