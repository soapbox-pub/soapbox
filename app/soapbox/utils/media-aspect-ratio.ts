export const minimumAspectRatio = 1; // Square
export const maximumAspectRatio = 10; // Generous min-height

export const isPanoramic = (ar: number) => {
  if (isNaN(ar)) return false;
  return ar >= maximumAspectRatio;
};

export const isPortrait = (ar: number) => {
  if (isNaN(ar)) return false;
  return ar <= minimumAspectRatio;
};

export const isNonConformingRatio = (ar: number) => {
  if (isNaN(ar)) return false;
  return !isPanoramic(ar) && !isPortrait(ar);
};
