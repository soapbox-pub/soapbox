import clsx from 'clsx';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Helmet from 'soapbox/components/helmet';
import { useSoapboxConfig } from 'soapbox/hooks';

import { Card, CardBody, CardHeader, CardTitle } from '../card/card';

type IColumnHeader = Pick<IColumn, 'label' | 'backHref' |'className'>;

/** Contains the column title with optional back button. */
const ColumnHeader: React.FC<IColumnHeader> = ({ label, backHref, className }) => {
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
    </CardHeader>
  );
};

export interface IColumn {
  /** Route the back button goes to. */
  backHref?: string
  /** Column title text. */
  label?: string
  /** Whether this column should have a transparent background. */
  transparent?: boolean
  /** Whether this column should have a title and back button. */
  withHeader?: boolean
  /** Extra class name for top <div> element. */
  className?: string
  /** Ref forwarded to column. */
  ref?: React.Ref<HTMLDivElement>
  /** Children to display in the column. */
  children?: React.ReactNode
}

/** A backdrop for the main section of the UI. */
const Column: React.FC<IColumn> = React.forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element => {
  const { backHref, children, label, transparent = false, withHeader = true, className } = props;
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

      <Card variant={transparent ? undefined : 'rounded'} className={className}>
        {withHeader && (
          <ColumnHeader
            label={label}
            backHref={backHref}
            className={clsx({ 'px-4 pt-4 sm:p-0': transparent })}
          />
        )}

        <CardBody>
          {children}
        </CardBody>
      </Card>
    </div>
  );
});

export {
  Column,
  ColumnHeader,
};
