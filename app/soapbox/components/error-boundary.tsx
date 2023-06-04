import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import * as BuildConfig from 'soapbox/build-config';
import { HStack, Text, Stack } from 'soapbox/components/ui';
import { captureException } from 'soapbox/monitoring';
import KVStore from 'soapbox/storage/kv-store';
import sourceCode from 'soapbox/utils/code';
import { unregisterSw } from 'soapbox/utils/sw';

import SiteLogo from './site-logo';

import type { RootState } from 'soapbox/store';

const goHome = () => location.href = '/';

const mapStateToProps = (state: RootState) => {
  const { links, logo } = getSoapboxConfig(state);

  return {
    siteTitle: state.instance.title,
    logo,
    links,
  };
};

interface Props extends ReturnType<typeof mapStateToProps> {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error: any
  componentStack: any
  browser?: Bowser.Parser.Parser
}

class ErrorBoundary extends React.PureComponent<Props, State> {

  state: State = {
    hasError: false,
    error: undefined,
    componentStack: undefined,
    browser: undefined,
  };

  textarea: HTMLTextAreaElement | null = null;

  componentDidCatch(error: any, info: any): void {
    captureException(error, {
      tags: {
        // Allow page crashes to be easily searched in Sentry.
        ErrorBoundary: 'yes',
      },
    });

    this.setState({
      hasError: true,
      error,
      componentStack: info && info.componentStack,
    });

    import(/* webpackChunkName: "error" */'bowser')
      .then(({ default: Bowser }) => {
        this.setState({
          browser: Bowser.getParser(window.navigator.userAgent),
        });
      })
      .catch(() => {});
  }

  setTextareaRef: React.RefCallback<HTMLTextAreaElement> = c => {
    this.textarea = c;
  };

  handleCopy: React.MouseEventHandler = () => {
    if (!this.textarea) return;

    this.textarea.select();
    this.textarea.setSelectionRange(0, 99999);

    document.execCommand('copy');
  };

  getErrorText = (): string => {
    const { error, componentStack } = this.state;
    return error + componentStack;
  };

  clearCookies: React.MouseEventHandler = (e) => {
    localStorage.clear();
    sessionStorage.clear();
    KVStore.clear();

    if ('serviceWorker' in navigator) {
      e.preventDefault();
      unregisterSw().then(goHome).catch(goHome);
    }
  };

  render() {
    const { browser, hasError } = this.state;
    const { children, links } = this.props;

    if (!hasError) {
      return children;
    }

    const isProduction = BuildConfig.NODE_ENV === 'production';

    const errorText = this.getErrorText();

    return (
      <div className='flex h-screen flex-col bg-white pb-12 pt-16 dark:bg-primary-900'>
        <main className='mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 sm:px-6 lg:px-8'>
          <div className='flex shrink-0 justify-center'>
            <a href='/' className='inline-flex'>
              <SiteLogo alt='Logo' className='h-12 w-auto cursor-pointer' />
            </a>
          </div>

          <div className='py-8'>
            <div className='mx-auto max-w-xl space-y-2 text-center'>
              <h1 className='text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-500 sm:text-4xl'>
                <FormattedMessage id='alert.unexpected.message' defaultMessage='Something went wrong.' />
              </h1>
              <p className='text-lg text-gray-700 dark:text-gray-600'>
                <FormattedMessage
                  id='alert.unexpected.body'
                  defaultMessage="We're sorry for the interruption. If the problem persists, please reach out to our support team. You may also try to {clearCookies} (this will log you out)."
                  values={{
                    clearCookies: (
                      <a href='/' onClick={this.clearCookies} className='text-primary-600 hover:underline dark:text-accent-blue'>
                        <FormattedMessage
                          id='alert.unexpected.clear_cookies'
                          defaultMessage='clear cookies and browser data'
                        />
                      </a>
                    ),
                  }}
                />
              </p>

              <Text theme='muted'>
                <Text weight='medium' tag='span' theme='muted'>{sourceCode.displayName}:</Text>

                {' '}{sourceCode.version}
              </Text>

              <div className='mt-10'>
                <a href='/' className='text-base font-medium text-primary-600 hover:underline dark:text-accent-blue'>
                  <FormattedMessage id='alert.unexpected.return_home' defaultMessage='Return Home' />
                  <span aria-hidden='true'> &rarr;</span>
                </a>
              </div>
            </div>

            {!isProduction && (
              <div className='mx-auto max-w-lg space-y-4 py-16'>
                {errorText && (
                  <textarea
                    ref={this.setTextareaRef}
                    className='block h-48 w-full rounded-md border-gray-300 bg-gray-100 p-4 font-mono text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-sm'
                    value={errorText}
                    onClick={this.handleCopy}
                    readOnly
                  />
                )}

                {browser && (
                  <Stack>
                    <Text weight='semibold'><FormattedMessage id='alert.unexpected.browser' defaultMessage='Browser' /></Text>
                    <Text theme='muted'>{browser.getBrowserName()} {browser.getBrowserVersion()}</Text>
                  </Stack>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className='mx-auto w-full max-w-7xl shrink-0 px-4 sm:px-6 lg:px-8'>
          <HStack justifyContent='center' space={4} element='nav'>
            {links.get('status') && (
              <>
                <a href={links.get('status')} className='text-sm font-medium text-gray-700 hover:underline dark:text-gray-600'>
                  <FormattedMessage id='alert.unexpected.links.status' defaultMessage='Status' />
                </a>
              </>
            )}

            {links.get('help') && (
              <>
                <span className='inline-block border-l border-gray-300' aria-hidden='true' />
                <a href={links.get('help')} className='text-sm font-medium text-gray-700 hover:underline dark:text-gray-600'>
                  <FormattedMessage id='alert.unexpected.links.help' defaultMessage='Help Center' />
                </a>
              </>
            )}

            {links.get('support') && (
              <>
                <span className='inline-block border-l border-gray-300' aria-hidden='true' />
                <a href={links.get('support')} className='text-sm font-medium text-gray-700 hover:underline dark:text-gray-600'>
                  <FormattedMessage id='alert.unexpected.links.support' defaultMessage='Support' />
                </a>
              </>
            )}
          </HStack>
        </footer>
      </div>
    );
  }

}

export default connect(mapStateToProps)(ErrorBoundary);
