import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '../../../../jest/test-helpers';
import ChatMessageReaction from '../chat-message-reaction';

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
        onAddReaction={jest.fn()}
        onRemoveReaction={jest.fn()}
      />,
    );

    expect(screen.getByRole('img').getAttribute('alt')).toEqual(emojiReaction.name);
    expect(screen.getByRole('button')).toHaveTextContent(String(emojiReaction.count));
  });

  it('triggers the "onAddReaction" function', async () => {
    const onAddFn = jest.fn();
    const onRemoveFn = jest.fn();
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
    const onAddFn = jest.fn();
    const onRemoveFn = jest.fn();
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