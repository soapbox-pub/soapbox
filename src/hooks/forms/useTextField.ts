import { useEffect, useState } from 'react';

/**
 * Returns props for `<input type="text">`.
 * If `initialValue` changes from undefined to a string, it will set the value.
 */
function useTextField(initialValue: string | undefined) {
  const [value, setValue] = useState(initialValue);
  const hasInitialValue = typeof initialValue === 'string';

  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (hasInitialValue) {
      setValue(initialValue);
    }
  }, [hasInitialValue]);

  return {
    value: value || '',
    onChange,
  };
}

export { useTextField };