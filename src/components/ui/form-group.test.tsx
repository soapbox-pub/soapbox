import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import FormGroup from './form-group.tsx';

describe('<FormGroup />', () => {
  it('connects the label and input', () => {
    render(
      <>
        <div>
          <FormGroup labelText='My label'>
            <input type='text' data-testid='winner' />
          </FormGroup>
        </div>

        <div>
          <FormGroup labelText='My other label'>
            <input type='text' />
          </FormGroup>
        </div>
      </>,
    );

    expect(screen.getByLabelText('My label')).toHaveAttribute('data-testid');
    expect(screen.getByLabelText('My other label')).not.toHaveAttribute('data-testid');
    expect(screen.queryByTestId('form-group-error')).not.toBeInTheDocument();
  });

  it('renders errors', () => {
    render(
      <FormGroup labelText='My label' errors={['is invalid', 'is required']}>
        <input type='text' />
      </FormGroup>,
    );

    expect(screen.getByTestId('form-group-error')).toHaveTextContent('is invalid');
  });

  it('renders label', () => {
    render(
      <FormGroup labelText='My label'>
        <input type='text' />
      </FormGroup>,
    );

    expect(screen.getByTestId('form-group-label')).toHaveTextContent('My label');
  });

  it('renders hint', () => {
    render(
      <FormGroup labelText='My label' hintText='My hint'>
        <input type='text' />
      </FormGroup>,
    );

    expect(screen.getByTestId('form-group-hint')).toHaveTextContent('My hint');
  });
});
