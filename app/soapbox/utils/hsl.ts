import type { Hsl } from 'soapbox/types/colors';

/** A neutral color. */
const GRAY: Hsl = { h: 0, s: 50, l: 50 };

/** Modulo (`%`) in both directions. */
// https://stackoverflow.com/a/39740009
const wrapAround = (value: number, delta: number, max: number): number => {
  if (delta >= 0) {
    return (value + delta) % max;
  } else {
    return max - ((max - (value + delta)) % max);
  }
};

/** Clamp the value within the range of `min` and `max`. */
// https://stackoverflow.com/a/47837835
const minmax = (
  value: number,
  min: number,
  max: number,
) => Math.min(max, Math.max(min, value));

/**
 * Represents an HSL color shift.
 *
 * For example, `[-20, 10, 0]` means "-20deg hue, +10% saturation, unchanged lightness".
*/
type HSLDelta = [hDelta: number, sDelta: number, lDelta: number];

/** Tailwind color shade. */
type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
/** Tailwind color palette with HSL. */
type HSLPalette = Record<Shade, Hsl>;
/** Tailwind color palette delta map (in HSL). */
type HSLPaletteDelta = Record<Shade, HSLDelta>;

/** Alter the color by the given delta. */
const hslShift = (seed: Hsl, delta: HSLDelta): Hsl => {
  return {
    h: wrapAround(seed.h, delta[0], 360),
    s: minmax(seed.s + delta[1], 0, 100),
    l: minmax(seed.l + delta[2], 0, 100),
  };

};

/** Generate a color palette from a single color. */
const generatePalette = (seed: Hsl, paletteDelta: HSLPaletteDelta): HSLPalette => {
  const shades = Object.keys(paletteDelta) as Shade[];

  return shades.reduce((result: HSLPalette, shade: Shade) => {
    const delta = paletteDelta[shade];
    result[shade] = hslShift(seed, delta);
    return result;
  }, {} as HSLPalette);
};

/** Expands a partial color palette, filling in the gaps. */
const expandPalette = (palette: Partial<HSLPalette>, paletteDelta: HSLPaletteDelta): HSLPalette => {
  const seed = palette['500'] || GRAY;
  const generated = generatePalette(seed, paletteDelta);
  return Object.assign(generated, palette);
};

/** Convert a complete color palette into a delta map. */
const paletteToDelta = (palette: HSLPalette): HSLPaletteDelta => {
  const seed = palette['500'];
  const shades = Object.keys(palette) as Shade[];

  return shades.reduce((result: HSLPaletteDelta, shade: Shade) => {
    const color = palette[shade];
    result[shade] = [
      wrapAround(color.h, -seed.h, 360),
      minmax(color.s - seed.s, -100, 100),
      minmax(color.l - seed.l, -100, 100),
    ];
    return result;
  }, {} as HSLPaletteDelta);
};

export {
  hslShift,
  expandPalette,
  paletteToDelta,
  HSLDelta,
  HSLPaletteDelta,
};