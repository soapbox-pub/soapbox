import React from 'react';

interface IExtensionBadge {
  /** File extension. */
  ext: string,
}

/** Badge displaying a file extension. */
const ExtensionBadge: React.FC<IExtensionBadge> = ({ ext }) => {
  return (
    <div className='inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'>
      {ext}
    </div>
  );
};

export default ExtensionBadge;