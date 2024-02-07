import { type RecursiveKeyValuePair } from 'tailwindcss/types/config';

/** https://tailwindcss.com/docs/customizing-colors#using-css-variables */
function withOpacityValue(variable: string): string {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

/** Parse a single color as a CSS variable. */
const toColorVariable = (colorName: string, tint: number | null = null): string => {
  const suffix = tint ? `-${tint}` : '';
  const variable = `--color-${colorName}${suffix}`;

  return withOpacityValue(variable);
};

/** Parse list of tints into Tailwind function with CSS variables. */
const parseTints = (colorName: string, tints: number[]): RecursiveKeyValuePair => {
  return tints.reduce<Record<string, string>>((colorObj, tint) => {
    colorObj[tint] = toColorVariable(colorName, tint);
    return colorObj;
  }, {});
};

interface ColorMatrix {
  [colorName: string]: number[] | boolean;
}

/** Parse color matrix into Tailwind color palette. */
const parseColorMatrix = (colorMatrix: ColorMatrix): RecursiveKeyValuePair => {
  return Object.entries(colorMatrix).reduce<RecursiveKeyValuePair>((palette, colorData) => {
    const [colorName, tints] = colorData;

    // Conditionally parse array or single-tint colors
    if (Array.isArray(tints)) {
      palette[colorName] = parseTints(colorName, tints);
    } else if (tints === true) {
      palette[colorName] = toColorVariable(colorName);
    }

    return palette;
  }, {});
};

export {
  withOpacityValue,
  parseColorMatrix,
};
