import React from 'react';

interface IWidePage {
  children: React.ReactNode;
}

/** Wide page without any side components. */
const WidePage: React.FC<IWidePage> = ({ children }) => {
  return (
    <div className='black:border-gray-800 md:col-span-12 lg:col-span-9 lg:black:border-l'>
      {children}
    </div>
  );
};

export default WidePage;
