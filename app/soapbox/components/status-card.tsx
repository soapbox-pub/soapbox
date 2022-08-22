import classNames from 'classnames';
import React from 'react';

import { Card } from './ui';

interface IStatusCard {
  className?: string,
  variant?: 'default' | 'rounded',
  children: React.ReactNode,
}

/**
 * Wrapper around a Status with all the cute spacing.
 * Not to be confused with the API entity called "Card".
 */
const StatusCard: React.FC<IStatusCard> = ({ variant = 'rounded', className, children }) => {
  return (
    <Card
      variant={variant}
      className={classNames({
        'py-6 sm:p-5': variant === 'rounded',
      }, className)}
    >
      {children}
    </Card>
  );
};

export default StatusCard;
