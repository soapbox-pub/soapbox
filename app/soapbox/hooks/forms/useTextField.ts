import { useEffect, useState } from 'react';

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
    value,
    onChange,
  };
}

export { useTextField };