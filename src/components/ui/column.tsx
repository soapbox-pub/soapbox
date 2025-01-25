import clsx from 'clsx';
import { forwardRef } from 'react';
import { useHistory } from 'react-router-dom';

import Helmet from 'soapbox/components/helmet.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';

import { Card, CardBody, CardHeader, CardTitle } from './card.tsx';

type IColumnHeader = Pick<IColumn, 'label' | 'backHref' | 'className' | 'action'>;

/** Contains the column title with optional back button. */
const ColumnHeader: React.FC<IColumnHeader> = ({ label, backHref, className, action }) => {
  const history = useHistory();

  const handleBackClick = () => {
    if (backHref) {
      history.push(backHref);
      return;
    }

    if (history.length === 1) {
      history.push('/');
    } else {
      history.goBack();
    }
  };

  return (
    <CardHeader className={className} onBackClick={handleBackClick}>
      <CardTitle title={label} />

      {action && (
        <div className='flex grow justify-end'>
          {action}
        </div>
      )}
    </CardHeader>
  );
};

export interface IColumn {
  /** Route the back button goes to. */
  backHref?: string;
  /** Column title text. */
  label?: string;
  /** Whether this column should have a transparent background. */
  transparent?: boolean;
  /** Whether to display the column without padding. */
  slim?: boolean;
  /** Whether this column should have a title and back button. */
  withHeader?: boolean;
  /** Extra class name for top <div> element. */
  className?: string;
  /** Extra class name for the <CardBody> element. */
  bodyClassName?: string;
  /** Ref forwarded to column. */
  ref?: React.Ref<HTMLDivElement>;
  /** Children to display in the column. */
  children?: React.ReactNode;
  /** Action for the ColumnHeader, displayed at the end. */
  action?: React.ReactNode;
  /** Column size, inherited from Card. */
  size?: 'md' | 'lg' | 'xl';
}

/** A backdrop for the main section of the UI. */
const Column = forwardRef<HTMLDivElement, IColumn>((props, ref): JSX.Element => {
  const { backHref, children, label, transparent = false, slim, withHeader = true, className, bodyClassName, action, size } = props;
  const soapboxConfig = useSoapboxConfig();

  return (
    <div role='region' className='relative' ref={ref} aria-label={label} column-type={transparent ? 'transparent' : 'filled'}>
      <Helmet>
        <title>{label}</title>

        {soapboxConfig.appleAppId && (
          <meta
            data-react-helmet='true'
            name='apple-itunes-app'
            content={`app-id=${soapboxConfig.appleAppId}, app-argument=${location.href}`}
          />
        )}
      </Helmet>

      <Stack>
        {withHeader && (
          <ColumnHeader
            label={label}
            backHref={backHref}
            className={clsx('px-5 py-4', {
              'sticky top-12 z-20 bg-white/90 dark:bg-primary-900/90 black:bg-black/90 backdrop-blur lg:top-0': !transparent,
              '-mb-4': !slim,
            })}
            action={action}
          />
        )}

        <Card size={size} transparent={transparent} className={className} slim={slim}>
          <CardBody className={bodyClassName}>
            {children}
          </CardBody>
        </Card>
      </Stack>
    </div>
  );
});

export {
  Column,
  ColumnHeader,
};
