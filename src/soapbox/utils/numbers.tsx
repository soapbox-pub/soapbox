import React from 'react';
import { FormattedNumber } from 'react-intl';
import { z } from 'zod';

/** Check if a value is REALLY a number. */
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);

/** The input is a number and is not NaN. */
export const realNumberSchema = z.coerce.number().refine(n => !isNaN(n));

export const secondsToDays = (seconds: number) => Math.floor(seconds / (3600 * 24));

const roundDown = (num: number) => {
  if (num >= 100 && num < 1000) {
    num = Math.floor(num);
  }

  const n = Number(num.toFixed(2));
  return (n > num) ? n - (1 / (Math.pow(10, 2))) : n;
};

/** Display a number nicely for the UI, eg 1000 becomes 1K. */
export const shortNumberFormat = (number: any, max?: number): React.ReactNode => {
  if (!isNumber(number)) return '•';

  let value = number;
  let factor: string = '';
  if (number >= 1000 && number < 1000000) {
    factor = 'k';
    value = roundDown(value / 1000);
  } else if (number >= 1000000) {
    factor = 'M';
    value = roundDown(value / 1000000);
  }

  if (max && value > max) {
    return <span>{max}+</span>;
  }

  return (
    <span>
      <FormattedNumber
        value={value}
        maximumFractionDigits={0}
        minimumFractionDigits={0}
        maximumSignificantDigits={3}
        style='decimal'
      />
      {factor}
    </span>
  );
};

/** Check if an entity ID is an integer (eg not a FlakeId). */
export const isIntegerId = (id: string): boolean => new RegExp(/^-?[0-9]+$/g).test(id);
