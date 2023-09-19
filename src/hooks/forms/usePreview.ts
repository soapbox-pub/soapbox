import { useMemo } from 'react';

/** Return a preview URL for a file. */
function usePreview(file: File | null | undefined): string | undefined {
  return useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
  }, [file]);
}

export { usePreview };
