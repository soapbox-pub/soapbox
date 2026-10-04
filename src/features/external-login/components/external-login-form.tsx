import alertCircleIcon from '@tabler/icons/outline/alert-circle.svg';
import arrowRightIcon from '@tabler/icons/outline/arrow-right.svg';
import serverIcon from '@tabler/icons/outline/server.svg';
import worldIcon from '@tabler/icons/outline/world.svg';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import { externalLogin, loginWithCode } from '@/actions/external-auth.ts';
import { HTTPError } from '@/api/HTTPError.ts';
import { type DirectoryServer, useServerSuggestions } from '@/api/hooks/useServerDirectory.ts';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
  ComboboxPopover,
} from '@/components/ui/combobox.tsx';
import Icon from '@/components/ui/icon.tsx';
import Spinner from '@/components/ui/spinner.tsx';
import Text from '@/components/ui/text.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { shortNumberFormat } from '@/utils/numbers.tsx';

const messages = defineMessages({
  instanceLabel: { id: 'login.fields.instance_label', defaultMessage: 'Instance' },
  instancePlaceholder: { id: 'login.fields.instance_placeholder', defaultMessage: 'example.com' },
  instanceFailed: { id: 'login_external.errors.instance_fail', defaultMessage: 'The instance returned an error.' },
  unreachable: { id: 'login_external.errors.unreachable', defaultMessage: 'Couldn\'t reach {host}. Check the address and try again.' },
  invalidHost: { id: 'login_external.errors.invalid_host', defaultMessage: 'Enter the domain of your server, like mastodon.social.' },
  submit: { id: 'login_external.submit', defaultMessage: 'Continue' },
});

/** Remembers the last server so returning users don't have to type it again. */
const LAST_SERVER_KEY = 'soapbox:external:lastServer';

/**
 * Turn whatever the user typed into a bare hostname.
 * Accepts `example.com`, `https://example.com/about`, and handles like `@alex@example.com`.
 */
export function normalizeHost(input: string): string {
  const value = input.trim();

  if (value.includes('://')) {
    try {
      return new URL(value).host.toLowerCase();
    } catch {
      return value.toLowerCase();
    }
  }

  return value
    .split('@').pop()!
    .split('/')[0]
    .toLowerCase();
}

/** Whether the value could plausibly be a server address. */
function isValidHost(input: string): boolean {
  if (input.includes('://')) {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }

  const host = normalizeHost(input);
  return /^[a-z0-9.-]+\.[a-z0-9-]+(:\d+)?$/i.test(host) || /^localhost(:\d+)?$/.test(host);
}

interface IExternalLoginForm {
  /** Visible label above the input. Without it, the label is only exposed to screen readers. */
  label?: React.ReactNode;
}

/** Form for logging into a remote instance */
const ExternalLoginForm: React.FC<IExternalLoginForm> = ({ label }) => {
  const query = new URLSearchParams(window.location.search);
  const code = query.get('code');
  const server = query.get('server');

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [host, setHost] = useState(() => server || localStorage.getItem(LAST_SERVER_KEY) || '');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const normalized = normalizeHost(host);
  const suggestions = useServerSuggestions(normalized);
  const exactMatch = suggestions.some((s) => s.domain === normalized);
  const showCustom = !exactMatch && isValidHost(host);

  const handleHostChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    setHost(currentTarget.value);
    setError(undefined);
  };

  const logIn = (value: string) => {
    if (!isValidHost(value)) {
      setError(intl.formatMessage(messages.invalidHost));
      return;
    }

    // Keep an explicit scheme (eg `http://localhost:4000`), otherwise send the bare host.
    const target = value.includes('://') ? value.trim() : normalizeHost(value);

    setLoading(true);
    setError(undefined);

    dispatch(externalLogin(target))
      .then(() => {
        localStorage.setItem(LAST_SERVER_KEY, target);
      })
      .catch((error: unknown) => {
        console.error(error);

        if (error instanceof HTTPError) {
          setError(intl.formatMessage(messages.instanceFailed));
        } else {
          setError(intl.formatMessage(messages.unreachable, { host: normalizeHost(target) }));
        }

        // If the server was invalid, clear it from the URL.
        // https://stackoverflow.com/a/40592892
        if (server) {
          window.history.pushState(null, '', window.location.pathname);
        }

        setLoading(false);
      });
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    logIn(host);
  };

  const handleSelect = (value: string) => {
    setHost(value);
    logIn(value);
  };

  useEffect(() => {
    if (code) {
      dispatch(loginWithCode(code));
    }
  }, [code]);

  useEffect(() => {
    if (server && !code) {
      logIn(server);
    }
  }, [server]);

  if (code || (server && !error)) {
    return <Spinner />;
  }

  return (
    <form onSubmit={handleSubmit} data-testid='external-login' className='w-full'>
      <label id='external-login-host-label' htmlFor='external-login-host' className={label ? 'mb-2 block font-medium text-gray-900 dark:text-gray-100' : 'sr-only'}>
        {label ?? intl.formatMessage(messages.instanceLabel)}
      </label>

      <Combobox onSelect={handleSelect} openOnFocus aria-labelledby='external-login-host-label' className='relative'>
        <div
          className={clsx(
            'flex items-center gap-2 rounded-xl bg-white p-1.5 shadow-sm ring-1 transition focus-within:ring-2 black:bg-black dark:bg-gray-900',
            error
              ? 'ring-danger-500 focus-within:ring-danger-500'
              : 'ring-gray-300 focus-within:ring-primary-500 dark:ring-gray-800 dark:focus-within:ring-primary-500',
          )}
        >
          <Icon src={worldIcon} className='ml-2 size-5 shrink-0 text-gray-500' aria-hidden />

          <ComboboxInput
            id='external-login-host'
            name='host'
            value={host}
            onChange={handleHostChange}
            placeholder={intl.formatMessage(messages.instancePlaceholder)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
            inputMode='url'
            disabled={isLoading}
            className='min-w-0 flex-1 border-none bg-transparent px-1 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:ring-0 dark:text-gray-100'
            selectOnClick
          />

          <button
            type='submit'
            disabled={isLoading || !host.trim()}
            className='flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-default disabled:opacity-50 dark:ring-offset-gray-900'
          >
            {isLoading ? (
              <span className='size-4 animate-spin rounded-full border-2 border-white/40 border-t-white' aria-hidden />
            ) : null}
            <span>{intl.formatMessage(messages.submit)}</span>
            {!isLoading && <Icon src={arrowRightIcon} className='size-4 rtl:rotate-180' aria-hidden />}
          </button>
        </div>

        {(!isLoading && (suggestions.length > 0 || showCustom)) && (
          <ComboboxPopover portal={false} className='absolute inset-x-0 top-full mt-2 overflow-hidden !rounded-xl'>
            <ComboboxList persistSelection>
              {showCustom && (
                <ComboboxOption value={normalized} className='!px-3'>
                  <ServerRow
                    icon={serverIcon}
                    title={normalized}
                    subtitle={<FormattedMessage id='login_external.custom_server' defaultMessage='Sign in on this server' />}
                  />
                </ComboboxOption>
              )}

              {suggestions.map((server) => (
                <ComboboxOption key={server.domain} value={server.domain} className='!px-3'>
                  <DirectoryServerRow server={server} />
                </ComboboxOption>
              ))}
            </ComboboxList>
          </ComboboxPopover>
        )}
      </Combobox>

      {error && (
        <div role='alert' className='mt-2 flex items-center gap-1.5 text-sm text-danger-600'>
          <Icon src={alertCircleIcon} className='size-4 shrink-0' aria-hidden />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
};

interface IServerRow {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  thumbnail?: string | null;
  icon?: string;
  aside?: React.ReactNode;
}

const ServerRow: React.FC<IServerRow> = ({ title, subtitle, thumbnail, icon, aside }) => (
  <div className='flex items-center gap-3'>
    <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800'>
      {thumbnail && <img src={thumbnail} alt='' className='size-full object-cover' loading='lazy' />}
      {(!thumbnail && icon) && <Icon src={icon} className='size-5 text-gray-500' aria-hidden />}
    </div>

    <div className='min-w-0 flex-1'>
      <Text weight='semibold' truncate className='[&_[data-user-value]]:text-primary-600 dark:[&_[data-user-value]]:text-accent-blue'>{title}</Text>
      {subtitle && <Text size='sm' theme='muted' truncate>{subtitle}</Text>}
    </div>

    {aside && <div className='shrink-0'>{aside}</div>}
  </div>
);

const DirectoryServerRow: React.FC<{ server: DirectoryServer }> = ({ server }) => (
  <ServerRow
    thumbnail={server.proxied_thumbnail}
    title={<ComboboxOptionText />}
    subtitle={server.description.trim() || server.domain}
    aside={
      <Text size='xs' theme='muted' align='right'>
        <FormattedMessage
          id='login_external.server_active_users'
          defaultMessage='{count} active'
          values={{ count: shortNumberFormat(server.last_week_users) }}
        />
      </Text>
    }
  />
);

export default ExternalLoginForm;
