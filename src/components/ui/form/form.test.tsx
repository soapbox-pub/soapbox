import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from 'soapbox/jest/test-helpers';

import Form from './form';

describe('<Form />', () => {
  it('renders children', () => {
    const onSubmitMock = vi.fn();
    render(
      <Form onSubmit={onSubmitMock}>children</Form>, // eslint-disable-line formatjs/no-literal-string-in-jsx
    );

    expect(screen.getByTestId('form')).toHaveTextContent('children');
  });

  it('handles onSubmit prop', () => {
    const onSubmitMock = vi.fn();
    render(
      <Form onSubmit={onSubmitMock}>children</Form>, // eslint-disable-line formatjs/no-literal-string-in-jsx
    );

    fireEvent.submit(
      screen.getByTestId('form'), {
        preventDefault: () => {},
      },
    );
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
