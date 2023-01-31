/** Minimum aspect ratio for layout/display. */
export const minimumAspectRatio = 3 / 4;
/** Maximum aspect ratio for layout/display. */
export const maximumAspectRatio = 4 / 3;
/** Minimum aspect ratio for letterboxing (portrait phone). */
export const letterboxMinRatio = 9 / 16;
/** Maximum aspect ratio for letterboxing (generous min-height). */
export const letterboxMaxRatio = 10;

/** The media is significantly horizontal. */
export const isPanoramic = (aspectRatio: number) => {
  if (isNaN(aspectRatio)) return false;
  return aspectRatio >= maximumAspectRatio;
};

/** The media is significantly vertical. */
export const isPortrait = (aspectRatio: number) => {
  if (isNaN(aspectRatio)) return false;
  return aspectRatio <= minimumAspectRatio;
};

/** The media is mostly square. */
export const isNonConformingRatio = (aspectRatio: number) => {
  if (isNaN(aspectRatio)) return false;
  return !isPanoramic(aspectRatio) && !isPortrait(aspectRatio);
};

/** Whether to letterbox the media. */
export const shouldLetterbox = (aspectRatio?: number): boolean => {
  if (!aspectRatio) return true;
  const withinLimits = aspectRatio >= letterboxMinRatio && aspectRatio <= letterboxMaxRatio;
  return !withinLimits;
};