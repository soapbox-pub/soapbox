import { renderHook, act } from '@testing-library/react-hooks';

import { listener, mockDisconnect } from '../__mocks__/resize-observer';
import { useDimensions } from '../useDimensions';

describe('useDimensions()', () => {
  beforeEach(() => {
    mockDisconnect.mockClear();
  });

  it('defaults to 0', () => {
    const { result } = renderHook(() => useDimensions());

    act(() => {
      const div = document.createElement('div');
      (result.current[1] as any)(div);
    });

    expect(result.current[2]).toMatchObject({
      width: 0,
      height: 0,
    });
  });

  it('measures the dimensions of a DOM element', () => {
    const { result } = renderHook(() => useDimensions());

    act(() => {
      const div = document.createElement('div');
      (result.current[1] as any)(div);
    });

    act(() => {
      listener!([
        {
          contentRect: {
            width: 200,
            height: 200,
          },
        },
      ]);
    });

    expect(result.current[2]).toMatchObject({
      width: 200,
      height: 200,
    });
  });

  it('disconnects on unmount', () => {
    const { result, unmount } = renderHook(() => useDimensions());

    act(() => {
      const div = document.createElement('div');
      (result.current[1] as any)(div);
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(0);
    unmount();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
