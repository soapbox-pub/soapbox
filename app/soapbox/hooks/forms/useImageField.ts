import { useState } from 'react';

import resizeImage from 'soapbox/utils/resize-image';

import { usePreview } from './usePreview';

interface UseImageFieldOpts {
  /** Resize the image to the max dimensions, if defined. */
  maxPixels?: number
  /** Fallback URL before a file is uploaded. */
  preview?: string
}

/** Returns props for `<input type="file">`, and optionally resizes the file. */
function useImageField(opts: UseImageFieldOpts = {}) {
  const [file, setFile] = useState<File>();
  const src = usePreview(file) || opts.preview;

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async ({ target: { files } }) => {
    const file = files?.item(0);
    if (!file) return;

    if (typeof opts.maxPixels === 'number') {
      setFile(await resizeImage(file, opts.maxPixels));
    } else {
      setFile(file);
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