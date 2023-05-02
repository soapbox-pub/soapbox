import React from 'react';

import { buildGroupTag } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';

import TagListItem from '../tag-list-item';

describe('<TagListItem', () => {
  it('should render correctly', () => {
    const tag = buildGroupTag({ name: 'tag 1', groups: 5 });
    render(<TagListItem tag={tag} />);

    expect(screen.getByTestId('tag-list-item')).toHaveTextContent(tag.name);
    expect(screen.getByTestId('tag-list-item')).toHaveTextContent('Number of groups: 5');
  });
});