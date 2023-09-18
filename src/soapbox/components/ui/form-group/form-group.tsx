import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Checkbox from '../checkbox/checkbox';
import HStack from '../hstack/hstack';
import Stack from '../stack/stack';

interface IFormGroup {
  /** Input label message. */
  labelText?: React.ReactNode
  /** Input label tooltip message. */
  labelTitle?: string
  /** Input hint message. */
  hintText?: React.ReactNode
  /** Input errors. */
  errors?: string[]
  /** Elements to display within the FormGroup. */
  children: React.ReactNode
}

/** Input container with label. Renders the child. */
const FormGroup: React.FC<IFormGroup> = (props) => {
  const { children, errors = [], labelText, labelTitle, hintText } = props;
  const formFieldId: string = useMemo(() => `field-${uuidv4()}`, []);
  const inputChildren = React.Children.toArray(children);
  const hasError = errors?.length > 0;

  let firstChild;
  if (React.isValidElement(inputChildren[0])) {
    firstChild = React.cloneElement(
      inputChildren[0],
      // @ts-ignore
      { id: formFieldId },
    );
  }

  // @ts-ignore
  const isCheckboxFormGroup = firstChild?.type === Checkbox;

  if (isCheckboxFormGroup) {
    return (
      <HStack alignItems='start' space={2}>
        {firstChild}

        <Stack>
          {labelText && (
            <label
              htmlFor={formFieldId}
              data-testid='form-group-label'
              className='-mt-0.5 block text-sm font-medium text-gray-900 dark:text-gray-100'
              title={labelTitle}
            >
              {labelText}
            </label>
          )}

          {hasError && (
            <div>
              <p
                data-testid='form-group-error'
                className='form-error relative mt-0.5 inline-block rounded-md bg-danger-200 px-2 py-1 text-xs text-danger-900'
              >
                {errors.join(', ')}
              </p>
            </div>
          )}

          {hintText && (
            <p data-testid='form-group-hint' className='mt-0.5 text-xs text-gray-700 dark:text-gray-600'>
              {hintText}
            </p>
          )}
        </Stack>
      </HStack>
    );
  }

  return (
    <div>
      {labelText && (
        <label
          htmlFor={formFieldId}
          data-testid='form-group-label'
          className='block text-sm font-medium text-gray-900 dark:text-gray-100'
          title={labelTitle}
        >
          {labelText}
        </label>
      )}

      <div className='mt-1 dark:text-white'>
        {hintText && (
          <p data-testid='form-group-hint' className='mb-0.5 text-xs text-gray-700 dark:text-gray-600'>
            {hintText}
          </p>
        )}

        {firstChild}
        {inputChildren.filter((_, i) => i !== 0)}

        {hasError && (
          <p
            data-testid='form-group-error'
            className='form-error relative mt-0.5 inline-block rounded-md bg-danger-200 px-2 py-1 text-xs text-danger-900'
          >
            {errors.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormGroup;
