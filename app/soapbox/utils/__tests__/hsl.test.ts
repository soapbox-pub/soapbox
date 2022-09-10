import {
  hslShift,
  expandPalette,
  paletteToDelta,
  HSLPaletteDelta,
} from '../hsl';

test('hslShift()', () => {
  expect(hslShift({ h: 50, s: 50, l: 50 }, [-200, 10, 0]))
    .toEqual({ h: 210, s: 60, l: 50 });

  expect(hslShift({ h: 1, s: 2, l: 3 }, [0, 0, 0]))
    .toEqual({ h: 1, s: 2, l: 3 });

  expect(hslShift({ h: 0, s: 100, l: 0 }, [-1, 1, -1]))
    .toEqual({ h: 359, s: 100, l: 0 });

  expect(hslShift({ h: 50, s: 50, l: 50 }, [-360, 10, 0]))
    .toEqual({ h: 50, s: 60, l: 50 });

  expect(hslShift({ h: 50, s: 50, l: 50 }, [200, 10, 0]))
    .toEqual({ h: 250, s: 60, l: 50 });
});

test('expandPalette()', () => {
  const palette = {
    200: { h: 7, s: 7, l: 7 },
    500: { h: 50, s: 50, l: 50 },
  };

  const paletteDelta: HSLPaletteDelta = {
    50: [-10, -100, 7],
    100: [0, 0, 0],
    200: [0, 0, 0],
    300: [0, 0, 0],
    400: [0, 0, 0],
    500: [0, 0, 0],
    600: [0, 0, 0],
    700: [0, 0, 0],
    800: [0, 0, 0],
    900: [10, 100, -7],
  };

  const expected = {
    50: { h: 40, s: 0, l: 57 },
    100: { h: 50, s: 50, l: 50 },
    200: { h: 7, s: 7, l: 7 },
    300: { h: 50, s: 50, l: 50 },
    400: { h: 50, s: 50, l: 50 },
    500: { h: 50, s: 50, l: 50 },
    600: { h: 50, s: 50, l: 50 },
    700: { h: 50, s: 50, l: 50 },
    800: { h: 50, s: 50, l: 50 },
    900: { h: 60, s: 100, l: 43 },
  };

  expect(expandPalette(palette, paletteDelta)).toEqual(expected);
});

test('paletteToDelta()', () => {
  const palette = {
    50: { h: 40, s: 0, l: 57 },
    100: { h: 50, s: 50, l: 50 },
    200: { h: 7, s: 7, l: 7 },
    300: { h: 50, s: 50, l: 50 },
    400: { h: 50, s: 50, l: 50 },
    500: { h: 50, s: 50, l: 50 },
    600: { h: 50, s: 50, l: 50 },
    700: { h: 50, s: 50, l: 50 },
    800: { h: 50, s: 50, l: 50 },
    900: { h: 60, s: 100, l: 43 },
  };

  const expected = {
    50: [-10, -50, 7],
    100: [0, 0, 0],
    200: [-43, -43, -43],
    300: [0, 0, 0],
    400: [0, 0, 0],
    500: [0, 0, 0],
    600: [0, 0, 0],
    700: [0, 0, 0],
    800: [0, 0, 0],
    900: [10, 50, -7],
  };

  expect(paletteToDelta(palette)).toEqual(expected);
});