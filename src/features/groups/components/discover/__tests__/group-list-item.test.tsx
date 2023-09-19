import React from 'react';

import { buildGroup } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';

import GroupListItem from '../group-list-item';

describe('<GroupListItem', () => {
  it('should render correctly', () => {
    const group = buildGroup({
      display_name: 'group name here',
      locked: false,
      members_count: 6,
    });
    render(<GroupListItem group={group} />);

    expect(screen.getByTestId('group-list-item')).toHaveTextContent(group.display_name);
    expect(screen.getByTestId('group-list-item')).toHaveTextContent('Public');
    expect(screen.getByTestId('group-list-item')).toHaveTextContent('6 members');
  });
});