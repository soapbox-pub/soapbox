import { useState } from 'react';

import resizeImage from 'soapbox/utils/resize-image';

import { usePreview } from './usePreview';

interface UseImageFieldOpts {
  /** Resize the image to the max dimensions, if defined. */
  maxPixels?: number
  /** Fallback URL before a file is uploaded. */
  preview?: string
}

/** Handle image, and optionally resize it. */
function useImageField(opts: UseImageFieldOpts = {}) {
  const [file, setFile] = useState<File>();
  const src = usePreview(file) || opts.preview;

  const onChange: React.ChangeEventHandler<HTMLInputElement> = ({ target: { files } }) => {
    const file = files?.item(0) || undefined;
    if (file) {
      if (typeof opts.maxPixels === 'number') {
        resizeImage(file, opts.maxPixels)
          .then((f) => setFile(f))
          .catch(console.error);
      } else {
        setFile(file);
      }
    }
  };

  return {
    src,
    file,
    onChange,
  };
}

export { useImageField };
export type { UseImageFieldOpts };