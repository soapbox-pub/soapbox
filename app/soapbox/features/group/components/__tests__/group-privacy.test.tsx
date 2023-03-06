import React from 'react';

import { render, screen } from 'soapbox/jest/test-helpers';
import { normalizeGroup } from 'soapbox/normalizers';
import { Group } from 'soapbox/types/entities';

import GroupPrivacy from '../group-privacy';

let group: Group;

describe('<GroupPrivacy />', () => {
  describe('with a Private group', () => {
    beforeEach(() => {
      group = normalizeGroup({
        locked: true,
      });
    });

    it('should render the correct text', () => {
      render(<GroupPrivacy group={group} />);

      expect(screen.getByTestId('group-privacy')).toHaveTextContent('Private');
    });
  });

  describe('with a Public group', () => {
    beforeEach(() => {
      group = normalizeGroup({
        locked: false,
      });
    });

    it('should render the correct text', () => {
      render(<GroupPrivacy group={group} />);

      expect(screen.getByTestId('group-privacy')).toHaveTextContent('Public');
    });
  });
});