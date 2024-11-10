import { describe, expect, it } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import FormActions from './form-actions.tsx';

describe('<FormActions />', () => {
  it('renders successfully', () => {
    render(<FormActions><div data-testid='child'>child</div></FormActions>); {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
