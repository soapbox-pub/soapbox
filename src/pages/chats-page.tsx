
interface IChatsPage {
  children: React.ReactNode;
}

/** Custom layout for chats on desktop. */
const ChatsPage: React.FC<IChatsPage> = ({ children }) => {
  return (
    <div className='black:border-gray-800 md:col-span-12 lg:col-span-9 lg:black:border-l'>
      {children}
    </div>
  );
};

export default ChatsPage;
