import React from 'react';

/** Custom layout for chats on desktop. */
const ChatsPage: React.FC = ({ children }) => {
  return (
    <div className='md:col-span-12 lg:col-span-9 pb-36'>
      {children}
    </div>
  );
};

export default ChatsPage;
