import React from 'react';

interface IExtensionBadge {
  /** File extension. */
  ext: string,
}

/** Badge displaying a file extension. */
const ExtensionBadge: React.FC<IExtensionBadge> = ({ ext }) => {
  return (
    <div className='inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
      {ext}
    </div>
  );
};

export default ExtensionBadge;