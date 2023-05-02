import clsx from 'clsx';
import React from 'react';
import StickyBox from 'react-sticky-box';

interface ISidebar {
  children: React.ReactNode
}
interface IAside {
  children?: React.ReactNode
}

interface ILayout {
  children: React.ReactNode
}

interface LayoutComponent extends React.FC<ILayout> {
  Sidebar: React.FC<ISidebar>
  Main: React.FC<React.HTMLAttributes<HTMLDivElement>>
  Aside: React.FC<IAside>
}

/** Layout container, to hold Sidebar, Main, and Aside. */
const Layout: LayoutComponent = ({ children }) => (
  <div className='relative sm:pt-4'>
    <div className='mx-auto max-w-3xl sm:px-6 md:grid md:max-w-7xl md:grid-cols-12 md:gap-8 md:px-8'>
      {children}
    </div>
  </div>
);

/** Left sidebar container in the UI. */
const Sidebar: React.FC<ISidebar> = ({ children }) => (
  <div className='hidden lg:col-span-3 lg:block'>
    <StickyBox offsetTop={80} className='pb-4'>
      {children}
    </StickyBox>
  </div>
);

/** Center column container in the UI. */
const Main: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className }) => (
  <main
    className={clsx({
      'md:col-span-12 lg:col-span-9 xl:col-span-6 pb-36': true,
    }, className)}
  >
    {children}
  </main>
);

/** Right sidebar container in the UI. */
const Aside: React.FC<IAside> = ({ children }) => (
  <aside className='hidden xl:col-span-3 xl:block'>
    <StickyBox offsetTop={80} className='space-y-6 pb-12'>
      {children}
    </StickyBox>
  </aside>
);

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export default Layout;
