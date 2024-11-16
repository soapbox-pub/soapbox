import { describe, expect, it } from 'vitest';

import { buildGroupTag } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import TagListItem from './tag-list-item.tsx';

describe('<TagListItem', () => {
  it('should render correctly', () => {
    const tag = buildGroupTag({ name: 'tag 1', groups: 5 });
    render(<TagListItem tag={tag} />);

    expect(screen.getByTestId('tag-list-item')).toHaveTextContent(tag.name);
    expect(screen.getByTestId('tag-list-item')).toHaveTextContent('Number of groups: 5');
  });
});