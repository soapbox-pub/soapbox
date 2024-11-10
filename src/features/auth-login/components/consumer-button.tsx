import brandFacebookIcon from '@tabler/icons/outline/brand-facebook.svg';
import brandGithubIcon from '@tabler/icons/outline/brand-github.svg';
import brandGoogleIcon from '@tabler/icons/outline/brand-google.svg';
import brandSlackIcon from '@tabler/icons/outline/brand-slack.svg';
import brandTwitterIcon from '@tabler/icons/outline/brand-twitter.svg';
import brandWindowsIcon from '@tabler/icons/outline/brand-windows.svg';
import keyIcon from '@tabler/icons/outline/key.svg';
import { useIntl, defineMessages } from 'react-intl';

import { prepareRequest } from 'soapbox/actions/consumer-auth.ts';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { capitalize } from 'soapbox/utils/strings.ts';

const messages = defineMessages({
  tooltip: { id: 'oauth_consumer.tooltip', defaultMessage: 'Sign in with {provider}' },
});

/** Map between OAuth providers and brand icons. */
const BRAND_ICONS: Record<string, string> = {
  twitter: brandTwitterIcon,
  facebook: brandFacebookIcon,
  google: brandGoogleIcon,
  microsoft: brandWindowsIcon,
  slack: brandSlackIcon,
  github: brandGithubIcon,
};

interface IConsumerButton {
  provider: string;
}

/** OAuth consumer button for logging in with a third-party service. */
const ConsumerButton: React.FC<IConsumerButton> = ({ provider }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const icon = BRAND_ICONS[provider] || keyIcon;

  const handleClick = () => {
    dispatch(prepareRequest(provider));
  };

  return (
    <Tooltip text={intl.formatMessage(messages.tooltip, { provider: capitalize(provider) })}>
      <IconButton
        theme='outlined'
        className='p-2.5'
        iconClassName='h-6 w-6'
        src={icon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export default ConsumerButton;
