import React from 'react';

interface IChatsPage {
  children: React.ReactNode
}

/** Custom layout for chats on desktop. */
const ChatsPage: React.FC<IChatsPage> = ({ children }) => {
  return (
    <div className='md:col-span-12 lg:col-span-9'>
      {children}
    </div>
  );
};

export default ChatsPage;
