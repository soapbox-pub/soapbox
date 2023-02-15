import React, { createContext, useContext, useMemo, useState } from 'react';

type IStatContext = {
  unreadChatsCount: number
  setUnreadChatsCount: React.Dispatch<React.SetStateAction<number>>
}

const StatContext = createContext<any>({
  unreadChatsCount: 0,
});

interface IStatProvider {
  children: React.ReactNode
}

const StatProvider: React.FC<IStatProvider> = ({ children }) => {
  const [unreadChatsCount, setUnreadChatsCount] = useState<number>(0);

  const value = useMemo(() => ({
    unreadChatsCount,
    setUnreadChatsCount,
  }), [unreadChatsCount]);

  return (
    <StatContext.Provider value={value}>
      {children}
    </StatContext.Provider>
  );
};

const useStatContext = (): IStatContext => useContext(StatContext);

export { StatProvider, useStatContext, IStatContext };