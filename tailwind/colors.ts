import type { Config } from 'tailwindcss';

// https://tailwindcss.com/docs/customizing-colors#using-css-variables
function withOpacityValue(variable: string): string {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

// Parse a single color as a CSS variable
const toColorVariable = (colorName: string, tint: number | null = null) => {
  const suffix = tint ? `-${tint}` : '';
  const variable = `--color-${colorName}${suffix}`;

  return withOpacityValue(variable);
};

// Parse list of tints into Tailwind function with CSS variables
const parseTints = (colorName: string, tints: number[]) => {
  return tints.reduce<Record<number, string>>((colorObj, tint) => {
    colorObj[tint] = toColorVariable(colorName, tint);
    return colorObj;
  }, {});
};

interface ColorMatrix {
  [color: string]: number[] | boolean
}

// Parse color matrix into Tailwind color palette
const parseColorMatrix = (colorMatrix: ColorMatrix): Config['colors'] => {
  return Object.entries(colorMatrix).reduce<Config['colors']>((palette, colorData) => {
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
