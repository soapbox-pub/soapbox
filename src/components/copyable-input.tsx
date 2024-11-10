import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, HStack, Input } from './ui/index.ts';

interface ICopyableInput {
  /** Text to be copied. */
  value: string;
  /** Input type. */
  type?: 'text' | 'password';
  /** Callback after the value has been copied. */
  onCopy?(): void;
}

/** An input with copy abilities. */
const CopyableInput: React.FC<ICopyableInput> = ({ value, type = 'text', onCopy }) => {
  const input = useRef<HTMLInputElement>(null);

  const selectInput = () => {
    input.current?.select();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
    } else {
      document.execCommand('copy');
    }

    onCopy?.();
  };

  return (
    <HStack alignItems='center'>
      <Input
        ref={input}
        type={type}
        value={value}
        className='rounded-r-none rtl:rounded-l-none rtl:rounded-r-lg'
        outerClassName='grow'
        onClick={selectInput}
        readOnly
      />

      <Button
        theme='primary'
        className='mt-1 h-full rounded-l-none rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none'
        onClick={selectInput}
      >
        <FormattedMessage id='input.copy' defaultMessage='Copy' />
      </Button>
    </HStack>
  );
};

export default CopyableInput;
