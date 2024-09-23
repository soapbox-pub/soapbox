import React from 'react';

interface IManageZapSplitPage {
  children: React.ReactNode;
}

/** Custom layout for Manage Zap Split on desktop. */
const ManageZapSplitPage: React.FC<IManageZapSplitPage> = ({ children }) => {
  return (
    <div className='black:border-gray-800 md:col-span-12 lg:col-span-9 lg:black:border-l'>
      {children}
    </div>
  );
};

export default ManageZapSplitPage;
