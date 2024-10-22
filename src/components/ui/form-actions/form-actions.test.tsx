import React from 'react';

import { render, screen } from 'soapbox/jest/test-helpers';

import FormActions from './form-actions';

describe('<FormActions />', () => {
  it('renders successfully', () => {
    render(<FormActions><div data-testid='child'>child</div></FormActions>); {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
