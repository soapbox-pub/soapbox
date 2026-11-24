import { describe, expect, it } from 'vitest';

import { act, fireEvent, render, screen } from '@/jest/test-helpers.tsx';

import SafeEmbed from './safe-embed.tsx';

describe('<SafeEmbed />', () => {
  it('never gives the frame this page\'s origin', () => {
    render(<SafeEmbed title='embed' sandbox='allow-same-origin allow-scripts' html='<p>hi</p>' />);

    const frame = screen.getByTitle('embed') as HTMLIFrameElement;
    expect(frame.getAttribute('sandbox')).toBe('allow-scripts');
    expect(frame.getAttribute('srcdoc')).toContain('<p>hi</p>');
  });

  it('ignores height messages from other windows', () => {
    render(<SafeEmbed title='embed' sandbox='allow-scripts' html='<p>hi</p>' />);
    const frame = screen.getByTitle('embed') as HTMLIFrameElement;

    act(() => {
      fireEvent(window, new MessageEvent('message', { data: { type: 'setHeight', height: 500 }, source: window }));
    });
    expect(frame.getAttribute('height')).toBeNull();

    act(() => {
      fireEvent(window, new MessageEvent('message', { data: { type: 'setHeight', height: 500 }, source: frame.contentWindow }));
    });
    expect(frame.getAttribute('height')).toBe('500');
  });
});
