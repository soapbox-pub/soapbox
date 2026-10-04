import brandOpenSourceIcon from '@tabler/icons/outline/brand-open-source.svg';
import plugConnectedIcon from '@tabler/icons/outline/plug-connected.svg';
import shieldLockIcon from '@tabler/icons/outline/shield-lock.svg';
import { FormattedMessage } from 'react-intl';

import SiteLogo from '@/components/site-logo.tsx';
import Icon from '@/components/ui/icon.tsx';
import Text from '@/components/ui/text.tsx';
import ExternalLoginForm from '@/features/external-login/components/external-login-form.tsx';
import sourceCode from '@/utils/code.ts';

/**
 * Landing page shown when Soapbox FE isn't served by a backend of its own,
 * eg on a static host. Users pick the server they already have an account on.
 */
const StandaloneLanding: React.FC = () => {
  const isCallback = new URLSearchParams(window.location.search).has('code');

  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden'>
      <div aria-hidden className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -top-48 left-1/2 size-[44rem] translate-x-[-70%] rounded-full bg-gradient-start opacity-20 blur-3xl dark:opacity-25' />
        <div className='absolute -top-32 left-1/2 size-[36rem] translate-x-[-10%] rounded-full bg-gradient-end opacity-20 blur-3xl dark:opacity-25' />
      </div>

      <header className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5'>
        <div className='flex items-center gap-2.5'>
          <SiteLogo alt='' className='h-8 w-auto' />
          <Text size='lg' weight='bold' tag='span'>{sourceCode.displayName}</Text>
        </div>

        <a
          href={sourceCode.url}
          target='_blank'
          rel='noopener'
          className='text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200'
        >
          <FormattedMessage id='standalone.source_code' defaultMessage='Source code' />
        </a>
      </header>

      <main className='flex flex-1 flex-col'>
        <section className='mx-auto flex w-full max-w-2xl flex-col items-center px-6 pb-16 pt-10 text-center sm:pt-20'>
          {isCallback ? (
            <ExternalLoginForm />
          ) : (
            <>
              <span className='mb-6 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/60 dark:text-gray-400 dark:ring-gray-800'>
                <FormattedMessage id='standalone.compat' defaultMessage='Works with Mastodon, Pleroma, GoToSocial, and more' />
              </span>

              <h1 className='text-balance text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl'>
                <FormattedMessage id='standalone.heading' defaultMessage='The Fediverse, your way.' />
              </h1>

              <Text size='lg' theme='muted' className='mt-4 max-w-xl text-balance'>
                <FormattedMessage
                  id='standalone.subheading'
                  defaultMessage='{name} is a fast, friendly web client for the Fediverse. Sign in with the account you already have. Nothing to install, nothing to migrate.'
                  values={{ name: sourceCode.displayName }}
                />
              </Text>

              <div className='mt-10 w-full max-w-lg text-left'>
                <ExternalLoginForm
                  label={<FormattedMessage id='standalone.server_label' defaultMessage='Which server is your account on?' />}
                />

                <Text size='sm' theme='muted' className='mt-3'>
                  <FormattedMessage
                    id='standalone.no_account'
                    defaultMessage="Don't have an account yet? {link}"
                    values={{
                      link: (
                        <a href='https://joinmastodon.org/servers' target='_blank' rel='noopener' className='font-medium text-primary-600 hover:underline dark:text-accent-blue'>
                          <FormattedMessage id='standalone.find_server' defaultMessage='Find a server to join' />
                        </a>
                      ),
                    }}
                  />
                </Text>
              </div>
            </>
          )}
        </section>

        {!isCallback && (
          <section className='mx-auto grid w-full max-w-5xl gap-4 px-6 pb-16 sm:grid-cols-3'>
            <Feature
              icon={plugConnectedIcon}
              title={<FormattedMessage id='standalone.feature.servers.title' defaultMessage='Bring your own server' />}
              body={<FormattedMessage id='standalone.feature.servers.body' defaultMessage='Use the account you already have on any server that speaks the Mastodon API.' />}
            />
            <Feature
              icon={shieldLockIcon}
              title={<FormattedMessage id='standalone.feature.private.title' defaultMessage='Straight to your server' />}
              body={<FormattedMessage id='standalone.feature.private.body' defaultMessage='You sign in on your own server, so your password never passes through us. Your session stays in this browser.' />}
            />
            <Feature
              icon={brandOpenSourceIcon}
              title={<FormattedMessage id='standalone.feature.open_source.title' defaultMessage='Free and open source' />}
              body={<FormattedMessage id='standalone.feature.open_source.body' defaultMessage='Licensed under the AGPL. Read the code, report issues, or host your own copy.' />}
            />
          </section>
        )}
      </main>

      <footer className='mx-auto w-full max-w-5xl p-6'>
        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='getting_started.open_source_notice'
            defaultMessage='{code_name} is open source software. You can contribute or report issues at {code_link} (v{code_version}).'
            values={{
              code_name: sourceCode.displayName,
              code_link: <a className='underline' href={sourceCode.url} rel='noopener' target='_blank'>{sourceCode.repository}</a>,
              code_version: sourceCode.version,
            }}
          />
        </Text>
      </footer>
    </div>
  );
};

interface IFeature {
  icon: string;
  title: React.ReactNode;
  body: React.ReactNode;
}

const Feature: React.FC<IFeature> = ({ icon, title, body }) => (
  <div className='rounded-2xl bg-white/70 p-6 ring-1 ring-gray-200 backdrop-blur black:bg-black dark:bg-gray-900/60 dark:ring-gray-800'>
    <div className='mb-4 flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-accent-blue'>
      <Icon src={icon} className='size-5' aria-hidden />
    </div>
    <Text weight='semibold' className='mb-1'>{title}</Text>
    <Text size='sm' theme='muted'>{body}</Text>
  </div>
);

export default StandaloneLanding;
