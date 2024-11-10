import { describe, expect, it } from 'vitest';

import { buildGroup } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import GroupGridItem from './group-grid-item.tsx';

describe('<GroupGridItem', () => {
  it('should render correctly', () => {
    const group = buildGroup({
      display_name: 'group name here',
      locked: false,
      members_count: 6,
    });
    render(<GroupGridItem group={group} />);

    expect(screen.getByTestId('group-grid-item')).toHaveTextContent(group.display_name);
    expect(screen.getByTestId('group-grid-item')).toHaveTextContent('Public');
    expect(screen.getByTestId('group-grid-item')).toHaveTextContent('6 members');
  });
});