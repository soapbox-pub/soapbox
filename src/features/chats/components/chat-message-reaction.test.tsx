import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from 'soapbox/jest/test-helpers';

import ChatMessageReaction from './chat-message-reaction';

const emojiReaction = ({
  name: '👍',
  count: 1,
  me: false,
});

describe('<ChatMessageReaction />', () => {
  it('renders properly', () => {
    render(
      <ChatMessageReaction
        emojiReaction={emojiReaction}
        onAddReaction={vi.fn()}
        onRemoveReaction={vi.fn()}
      />,
    );

    expect(screen.getByRole('img').getAttribute('alt')).toEqual(emojiReaction.name);
    expect(screen.getByRole('button')).toHaveTextContent(String(emojiReaction.count));
  });

  it('triggers the "onAddReaction" function', async () => {
    const onAddFn = vi.fn();
    const onRemoveFn = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatMessageReaction
        emojiReaction={emojiReaction}
        onAddReaction={onAddFn}
        onRemoveReaction={onRemoveFn}
      />,
    );

    expect(onAddFn).not.toBeCalled();
    expect(onRemoveFn).not.toBeCalled();

    await user.click(screen.getByRole('button'));

    // add function triggered
    expect(onAddFn).toBeCalled();
    expect(onRemoveFn).not.toBeCalled();
  });

  it('triggers the "onRemoveReaction" function', async () => {
    const onAddFn = vi.fn();
    const onRemoveFn = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatMessageReaction
        emojiReaction={({
          name: '👍',
          count: 1,
          me: true,
        })}
        onAddReaction={onAddFn}
        onRemoveReaction={onRemoveFn}
      />,
    );

    expect(onAddFn).not.toBeCalled();
    expect(onRemoveFn).not.toBeCalled();

    await user.click(screen.getByRole('button'));

    // remove function triggered
    expect(onAddFn).not.toBeCalled();
    expect(onRemoveFn).toBeCalled();
  });
});