import { beforeEach, describe, expect, it } from 'vitest';

import { buildGroup } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';
import { Group } from 'soapbox/types/entities.ts';

import GroupPrivacy from './group-privacy.tsx';

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