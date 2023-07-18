import clsx from 'clsx';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Select } from '../../components/ui';

interface IInputContainer {
  label?: React.ReactNode
  hint?: React.ReactNode
  required?: boolean
  type?: string
  extraClass?: string
  error?: boolean
  children: React.ReactNode
}

export const InputContainer: React.FC<IInputContainer> = (props) => {
  const containerClass = clsx('input', {
    'with_label': props.label,
    'required': props.required,
    'boolean': props.type === 'checkbox',
    'field_with_errors': props.error,
  }, props.extraClass);

  return (
    <div className={containerClass}>
      {props.children}
      {props.hint && <span className='hint'>{props.hint}</span>}
    </div>
  );
};

interface ILabelInputContainer {
  label?: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
}

export const LabelInputContainer: React.FC<ILabelInputContainer> = ({ label, hint, children }) => {
  const [id] = useState(uuidv4());
  const childrenWithProps = React.Children.map(children, child => (
    // @ts-ignore: not sure how to get the right type here
    React.cloneElement(child, { id: id, key: id })
  ));

  return (
    <div className='label_input'>
      <label htmlFor={id}>{label}</label>
      <div className='label_input__wrapper'>
        {childrenWithProps}
      </div>
      {hint && <span className='hint'>{hint}</span>}
    </div>
  );
};

interface ILabelInput {
  label?: React.ReactNode
}

export const LabelInput: React.FC<ILabelInput> = ({ label, ...props }) => (
  <LabelInputContainer label={label}>
    <input {...props} />
  </LabelInputContainer>
);

interface ILabelTextarea {
  label?: React.ReactNode
}

export const LabelTextarea: React.FC<ILabelTextarea> = ({ label, ...props }) => (
  <LabelInputContainer label={label}>
    <textarea {...props} />
  </LabelInputContainer>
);

interface ISimpleInput {
  type: string
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: boolean
  onChange?: React.ChangeEventHandler
  min?: number
  max?: number
  pattern?: string
  name?: string
  placeholder?: string
  value?: string | number
  autoComplete?: string
  autoCorrect?: string
  autoCapitalize?: string
  required?: boolean
}

export const SimpleInput: React.FC<ISimpleInput> = (props) => {
  const { hint, error, ...rest } = props;
  const Input = props.label ? LabelInput : 'input';

  return (
    <InputContainer {...props}>
      <Input {...rest} />
    </InputContainer>
  );
};

interface ICheckbox {
  label?: React.ReactNode
  hint?: React.ReactNode
  name?: string
  checked?: boolean
  disabled?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  required?: boolean
}

export const Checkbox: React.FC<ICheckbox> = (props) => (
  <SimpleInput type='checkbox' {...props} />
);

interface ISelectDropdown {
  className?: string
  label?: React.ReactNode
  hint?: React.ReactNode
  items: Record<string, string>
  defaultValue?: string
  onChange?: React.ChangeEventHandler
}

export const SelectDropdown: React.FC<ISelectDropdown> = (props) => {
  const { label, hint, items, ...rest } = props;

  const optionElems = Object.keys(items).map(item => (
    <option key={item} value={item}>{items[item]}</option>
  ));

  // @ts-ignore
  const selectElem = <Select {...rest}>{optionElems}</Select>;

  return label ? (
    <LabelInputContainer label={label} hint={hint}>{selectElem}</LabelInputContainer>
  ) : selectElem;
};

interface ITextInput {
  name?: string
  onChange?: React.ChangeEventHandler
  label?: React.ReactNode
  hint?: React.ReactNode
  placeholder?: string
  value?: string
  autoComplete?: string
  autoCorrect?: string
  autoCapitalize?: string
  pattern?: string
  error?: boolean
  required?: boolean
}

export const TextInput: React.FC<ITextInput> = props => (
  <SimpleInput type='text' {...props} />
);

export const FileChooser : React.FC = (props) => (
  <SimpleInput type='file' {...props} />
);

FileChooser.defaultProps = {
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

interface IFileChooserLogo {
  label?: React.ReactNode
  hint?: React.ReactNode
  name?: string
  accept?: string[]
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export const FileChooserLogo: React.FC<IFileChooserLogo> = props => (
  <SimpleInput type='file' {...props} />
);

FileChooserLogo.defaultProps = {
  accept: ['image/svg', 'image/png'],
};
