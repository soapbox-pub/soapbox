import {
  withOpacityValue,
  parseColorMatrix,
} from './colors';

describe('withOpacityValue()', () => {
  it('returns a Tailwind color function with alpha support', () => {
    const result = withOpacityValue('--color-primary-500');

    // It returns a function
    expect(typeof result).toBe('function');

    // Test calling the function
    expect(result).toBe('rgb(var(--color-primary-500) / <alpha-value>)');
  });
});

describe('parseColorMatrix()', () => {
  it('returns a Tailwind color object', () => {
    const colorMatrix = {
      gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      success: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      danger: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      accent: [300, 500],
    };

    const result = parseColorMatrix(colorMatrix);

    // Colors are mapped to functions which return CSS values
    // @ts-ignore
    expect(result.accent['300']).toEqual('rgb(var(--color-accent-300) / <alpha-value>)');
  });

  it('parses single-tint values', () => {
    const colorMatrix = {
      gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      success: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      danger: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      accent: [300, 500],
      'gradient-start': true,
      'gradient-end': true,
    };

    const result = parseColorMatrix(colorMatrix);

    expect(result['gradient-start']).toEqual('rgb(var(--color-gradient-start) / <alpha-value>)');
  });
});
