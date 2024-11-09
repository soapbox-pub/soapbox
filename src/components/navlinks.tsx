import { Link } from 'react-router-dom';

import { Text } from 'soapbox/components/ui';
import { useSettings, useSoapboxConfig } from 'soapbox/hooks';

interface INavlinks {
  type: string;
}

const Navlinks: React.FC<INavlinks> = ({ type }) => {
  const { locale } = useSettings();
  const { copyright, navlinks } = useSoapboxConfig();

  return (
    <footer className='relative mx-auto mt-auto max-w-7xl py-8'>
      <div className='flex flex-wrap justify-center'>
        {navlinks.get(type)?.map((link, idx) => {
          const url = link.url;
          const isExternal = url.startsWith('http');
          const Comp = (isExternal ? 'a' : Link) as 'a';
          const compProps = isExternal ? { href: url, target: '_blank' } : { to: url };

          return (
            <div key={idx} className='px-5 py-2'>
              <Comp {...compProps} className='text-primary-600 hover:underline dark:text-primary-400'>
                <Text tag='span' theme='inherit' size='sm'>
                  {(link.getIn(['titleLocales', locale]) || link.get('title')) as string}
                </Text>
              </Comp>
            </div>
          );
        })}
      </div>

      <div className='mt-6'>
        <Text theme='muted' align='center' size='sm'>{copyright}</Text>
      </div>
    </footer>
  );
};

export { Navlinks };
