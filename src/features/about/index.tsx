import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchAboutPage } from 'soapbox/actions/about';
import { Navlinks } from 'soapbox/components/navlinks';
import { Button, Card } from 'soapbox/components/ui';
import { useSoapboxConfig, useSettings, useAppDispatch } from 'soapbox/hooks';

import { languages } from '../preferences';

/** Displays arbitrary user-uploaded HTML on a page at `/about/:slug` */
const AboutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { slug } = useParams<{ slug?: string }>();

  const settings = useSettings();
  const soapboxConfig = useSoapboxConfig();

  const [pageHtml, setPageHtml] = useState<string>('');
  const [locale, setLocale] = useState<string>(settings.locale);

  const { aboutPages } = soapboxConfig;

  const page = aboutPages.get(slug || 'about');
  const defaultLocale = page?.get('default') as string | undefined;
  const pageLocales = page?.get('locales', []) as string[];

  useEffect(() => {
    const fetchLocale = Boolean(page && locale !== defaultLocale && pageLocales.includes(locale));
    dispatch(fetchAboutPage(slug, fetchLocale ? locale : undefined)).then(html => {
      setPageHtml(html);
    }).catch(error => {
      // TODO: Better error handling. 404 page?
      setPageHtml('<h1>Page not found</h1>');
    });
  }, [locale, slug]);

  const alsoAvailable = (defaultLocale) && (
    <div>
      <FormattedMessage id='about.also_available' defaultMessage='Available in:' />
      {' '} {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
      <ul className='inline list-none p-0'>
        <li className="inline after:content-['_·_']">
          <Button to='#' className='!border-none !p-0 !text-primary-600 hover:!underline focus:!ring-transparent focus:!ring-offset-0 dark:!text-accent-blue' theme='muted' onClick={() => setLocale(defaultLocale)}>
            {/* @ts-ignore */}
            {languages[defaultLocale] || defaultLocale}
          </Button>
        </li>
        {
          pageLocales?.map(locale => (
            <li className="inline after:content-['_·_'] last:after:content-none" key={locale}>
              <Button to='#' className='!border-none !p-0 !text-primary-600 hover:!underline focus:!ring-transparent focus:!ring-offset-0 dark:!text-accent-blue' theme='muted' onClick={() => setLocale(locale)}>
                {/* @ts-ignore */}
                {languages[locale] || locale}
              </Button>
            </li>
          ))
        }
      </ul>
    </div>
  );

  return (
    <div>
      <Card variant='rounded'>
        <div className='prose mx-auto py-4 dark:prose-invert sm:p-6'>
          <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
          {alsoAvailable}
        </div>
      </Card>

      <Navlinks type='homeFooter' />
    </div>
  );
};

export default AboutPage;
