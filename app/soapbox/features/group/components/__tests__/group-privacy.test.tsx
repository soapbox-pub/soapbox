import React from 'react';

import { buildGroup } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';
import { Group } from 'soapbox/types/entities';

import GroupPrivacy from '../group-privacy';

let group: Group;

describe('<GroupPrivacy />', () => {
  describe('with a Private group', () => {
    beforeEach(() => {
      group = buildGroup({
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
      group = buildGroup({
        locked: false,
      });
    });

    it('should render the correct text', () => {
      render(<GroupPrivacy group={group} />);

      expect(screen.getByTestId('group-privacy')).toHaveTextContent('Public');
    });
  });
});