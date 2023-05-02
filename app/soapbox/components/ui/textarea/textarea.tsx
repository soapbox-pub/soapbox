import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Stack from '../stack/stack';
import Text from '../text/text';

interface ITextarea extends Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength' | 'onChange' | 'onKeyDown' | 'onPaste' | 'required' | 'disabled' | 'rows' | 'readOnly'> {
  /** Put the cursor into the input on mount. */
  autoFocus?: boolean
  /** Allows the textarea height to grow while typing */
  autoGrow?: boolean
  /** Used with "autoGrow". Sets a max number of rows. */
  maxRows?: number
  /** Used with "autoGrow". Sets a min number of rows. */
  minRows?: number
  /** The initial text in the input. */
  defaultValue?: string
  /** Internal input name. */
  name?: string
  /** Renders the textarea as a code editor. */
  isCodeEditor?: boolean
  /** Text to display before a value is entered. */
  placeholder?: string
  /** Text in the textarea. */
  value?: string
  /** Whether the device should autocomplete text in this textarea. */
  autoComplete?: string
  /** Whether to display the textarea in red. */
  hasError?: boolean
  /** Whether or not you can resize the teztarea */
  isResizeable?: boolean
  /** Textarea theme. */
  theme?: 'default' | 'transparent'
  /** Whether to display a character counter below the textarea. */
  withCounter?: boolean
}

/** Textarea with custom styles. */
const Textarea = React.forwardRef(({
  isCodeEditor = false,
  hasError = false,
  isResizeable = true,
  onChange,
  autoGrow = false,
  maxRows = 10,
  minRows = 1,
  theme = 'default',
  maxLength,
  value,
  ...props
}: ITextarea, ref: React.ForwardedRef<HTMLTextAreaElement>) => {
  const length = value?.length || 0;
  const [rows, setRows] = useState<number>(autoGrow ? 1 : 4);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoGrow) {
      const textareaLineHeight = 20;
      const previousRows = event.target.rows;
      event.target.rows = minRows;

      const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

      if (currentRows === previousRows) {
        event.target.rows = currentRows;
      }

      if (currentRows >= maxRows) {
        event.target.rows = maxRows;
        event.target.scrollTop = event.target.scrollHeight;
      }

      setRows(currentRows < maxRows ? currentRows : maxRows);
    }

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <Stack space={1.5}>
      <textarea
        {...props}
        value={value}
        ref={ref}
        rows={rows}
        onChange={handleChange}
        className={clsx('block w-full rounded-md text-gray-900 placeholder:text-gray-600 dark:text-gray-100 dark:placeholder:text-gray-600 sm:text-sm', {
          'bg-white dark:bg-transparent shadow-sm border-gray-400 dark:border-gray-800 dark:ring-1 dark:ring-gray-800 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500':
            theme === 'default',
          'bg-transparent border-0 focus:border-0 focus:ring-0': theme === 'transparent',
          'font-mono': isCodeEditor,
          'text-red-600 border-red-600': hasError,
          'resize-none': !isResizeable,
        })}
      />

      {maxLength && (
        <div className='text-right rtl:text-left'>
          <Text size='xs' theme={maxLength - length < 0 ? 'danger' : 'muted'}>
            <FormattedMessage
              id='textarea.counter.label'
              defaultMessage='{count} characters remaining'
              values={{ count: maxLength - length }}
            />
          </Text>
        </div>
      )}
    </Stack>
  );
},
);

export default Textarea;
