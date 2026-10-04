import { FormattedMessage } from 'react-intl';

import SiteLogo from '@/components/site-logo.tsx';
import Text from '@/components/ui/text.tsx';
import ExternalLoginForm from '@/features/external-login/components/external-login-form.tsx';
import ThemePicker from '@/features/ui/components/theme-picker.tsx';
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

      <main className='flex flex-1 flex-col justify-center'>
        <section className='mx-auto flex w-full max-w-2xl flex-col items-center px-6 pb-24 pt-10 text-center'>
          {isCallback ? (
            <ExternalLoginForm />
          ) : (
            <>
              <h1 className='text-balance text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl'>
                <FormattedMessage id='standalone.heading' defaultMessage='The Fediverse, your way.' />
              </h1>

              <div className='mt-6 w-screen max-w-xl'>
                <ThemePicker />
              </div>

              <div className='mt-6 w-full max-w-lg text-left'>
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

export default StandaloneLanding;
