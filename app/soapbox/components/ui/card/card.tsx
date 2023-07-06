import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { HStack, Text } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';

const sizes = {
  md: 'p-4 sm:rounded-xl',
  lg: 'p-4 sm:p-6 sm:rounded-xl',
  xl: 'p-4 sm:p-10 sm:rounded-3xl',
};

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
});

export type CardSizes = keyof typeof sizes

interface ICard {
  /** The type of card. */
  variant?: 'default' | 'rounded' | 'slim'
  /** Card size preset. */
  size?: CardSizes
  /** Extra classnames for the <div> element. */
  className?: string
  /** Elements inside the card. */
  children: React.ReactNode
  tabIndex?: number
}

/** An opaque backdrop to hold a collection of related elements. */
const Card = React.forwardRef<HTMLDivElement, ICard>(({ children, variant = 'default', size = 'md', className, ...filteredProps }, ref): JSX.Element => (
  <div
    ref={ref}
    {...filteredProps}
    className={clsx({
      'bg-white dark:bg-primary-900 text-gray-900 dark:text-gray-100 shadow-lg dark:shadow-none': variant === 'rounded',
      [sizes[size]]: variant === 'rounded',
      'py-4': variant === 'slim',
    }, className)}
  >
    {children}
  </div>
));

interface ICardHeader {
  backHref?: string
  onBackClick?: (event: React.MouseEvent) => void
  className?: string
  children?: React.ReactNode
}

/**
 * Card header container with back button.
 * Typically holds a CardTitle.
 */
const CardHeader: React.FC<ICardHeader> = ({ className, children, backHref, onBackClick }): JSX.Element => {
  const intl = useIntl();

  const renderBackButton = () => {
    if (!backHref && !onBackClick) {
      return null;
    }

    const Comp: React.ElementType = backHref ? Link : 'button';
    const backAttributes = backHref ? { to: backHref } : { onClick: onBackClick };

    return (
      <Comp {...backAttributes} className='rounded-full text-gray-900 focus:ring-2 focus:ring-primary-500 dark:text-gray-100' aria-label={intl.formatMessage(messages.back)}>
        <SvgIcon src={require('@tabler/icons/arrow-left.svg')} className='h-6 w-6 rtl:rotate-180' />
        <span className='sr-only' data-testid='back-button'>{intl.formatMessage(messages.back)}</span>
      </Comp>
    );
  };

  return (
    <HStack alignItems='center' space={2} className={className}>
      {renderBackButton()}

      {children}
    </HStack>
  );
};

interface ICardTitle {
  title: React.ReactNode
}

/** A card's title. */
const CardTitle: React.FC<ICardTitle> = ({ title }): JSX.Element => (
  <Text size='xl' weight='bold' tag='h1' data-testid='card-title' truncate>{title}</Text>
);

interface ICardBody {
  /** Classnames for the <div> element. */
  className?: string
  /** Children to appear inside the card. */
  children: React.ReactNode
}

/** A card's body. */
const CardBody: React.FC<ICardBody> = ({ className, children }): JSX.Element => (
  <div data-testid='card-body' className={className}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardBody };
