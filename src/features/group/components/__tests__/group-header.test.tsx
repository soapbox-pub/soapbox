import React from 'react';

import { buildGroup } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';
import { Group } from 'soapbox/types/entities';

import GroupHeader from '../group-header';

let group: Group;

describe('<GroupHeader />', () => {
  describe('without a group', () => {
    it('should render the blankslate', () => {
      render(<GroupHeader group={null} />);
      expect(screen.getByTestId('group-header-missing')).toBeInTheDocument();
    });
  });

  describe('when the Group has been deleted', () => {
    it('only shows name, header, and avatar', () => {
      group = buildGroup({ display_name: 'my group', deleted_at: new Date().toISOString() });
      render(<GroupHeader group={group} />);

      expect(screen.queryAllByTestId('group-header-missing')).toHaveLength(0);
      expect(screen.queryAllByTestId('group-actions')).toHaveLength(0);
      expect(screen.queryAllByTestId('group-meta')).toHaveLength(0);
      expect(screen.getByTestId('group-header-image')).toBeInTheDocument();
      expect(screen.getByTestId('group-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('group-name')).toBeInTheDocument();
    });
  });

  describe('with a valid Group', () => {
    it('only shows all fields', () => {
      group = buildGroup({ display_name: 'my group', deleted_at: null });
      render(<GroupHeader group={group} />);

      expect(screen.queryAllByTestId('group-header-missing')).toHaveLength(0);
      expect(screen.getByTestId('group-actions')).toBeInTheDocument();
      expect(screen.getByTestId('group-meta')).toBeInTheDocument();
      expect(screen.getByTestId('group-header-image')).toBeInTheDocument();
      expect(screen.getByTestId('group-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('group-name')).toBeInTheDocument();
    });
  });
});