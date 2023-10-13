import React from 'react';

import { fireEvent, render, screen } from 'soapbox/jest/test-helpers';

import Form from './form';

describe('<Form />', () => {
  it('renders children', () => {
    const onSubmitMock = vi.fn();
    render(
      <Form onSubmit={onSubmitMock}>children</Form>,
    );

    expect(screen.getByTestId('form')).toHaveTextContent('children');
  });

  it('handles onSubmit prop', () => {
    const onSubmitMock = vi.fn();
    render(
      <Form onSubmit={onSubmitMock}>children</Form>,
    );

    fireEvent.submit(
      screen.getByTestId('form'), {
        preventDefault: () => {},
      },
    );
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
