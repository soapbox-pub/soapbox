import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from 'soapbox/jest/test-helpers';

import LayoutButtons, { GroupLayout } from '../layout-buttons';

describe('<LayoutButtons', () => {
  describe('when LIST view', () => {
    it('should render correctly', async () => {
      const onSelectFn = jest.fn();
      const user = userEvent.setup();

      render(<LayoutButtons layout={GroupLayout.LIST} onSelect={onSelectFn} />);

      expect(within(screen.getByTestId('layout-list-action')).getByTestId('svg-icon-loader')).toHaveClass('text-primary-600');
      expect(within(screen.getByTestId('layout-grid-action')).getByTestId('svg-icon-loader')).not.toHaveClass('text-primary-600');

      await user.click(screen.getByTestId('layout-grid-action'));
      expect(onSelectFn).toHaveBeenCalled();
    });
  });

  describe('when GRID view', () => {
    it('should render correctly', async () => {
      const onSelectFn = jest.fn();
      const user = userEvent.setup();

      render(<LayoutButtons layout={GroupLayout.GRID} onSelect={onSelectFn} />);

      expect(within(screen.getByTestId('layout-list-action')).getByTestId('svg-icon-loader')).not.toHaveClass('text-primary-600');
      expect(within(screen.getByTestId('layout-grid-action')).getByTestId('svg-icon-loader')).toHaveClass('text-primary-600');

      await user.click(screen.getByTestId('layout-grid-action'));
      expect(onSelectFn).toHaveBeenCalled();
    });
  });
});