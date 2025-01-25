import clsx from 'clsx';
import { Suspense } from 'react';
import StickyBox from 'react-sticky-box';

interface ISidebar {
  children: React.ReactNode;
}
interface IAside {
  children?: React.ReactNode;
}

interface ILayout {
  children: React.ReactNode;
}

interface LayoutComponent extends React.FC<ILayout> {
  Sidebar: React.FC<ISidebar>;
  Main: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Aside: React.FC<IAside>;
}

/** Layout container, to hold Sidebar, Main, and Aside. */
const Layout: LayoutComponent = ({ children }) => (
  <div className='relative flex grow flex-col'>
    <div className='mx-auto w-full max-w-3xl grow sm:px-6 md:grid md:max-w-7xl md:grid-cols-12 md:gap-8 md:px-8'>
      {children}
    </div>
  </div>
);

/** Left sidebar container in the UI. */
const Sidebar: React.FC<ISidebar> = ({ children }) => (
  <div className='hidden lg:col-span-3 lg:block'>
    <StickyBox className='py-6'>
      {children}
    </StickyBox>
  </div>
);

/** Center column container in the UI. */
const Main: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className }) => (
  <main className={clsx('border-gray-200 bg-white pb-6 black:border-gray-800 black:bg-black dark:border-gray-800 dark:bg-primary-900 md:col-span-12 lg:col-span-9 lg:border-l xl:col-span-6 xl:border-r', className)}>
    {children}
  </main>
);

/** Right sidebar container in the UI. */
const Aside: React.FC<IAside> = ({ children }) => (
  <aside className='hidden xl:col-span-3 xl:block'>
    <StickyBox className='space-y-6 py-6 pb-12'>
      <Suspense>
        {children}
      </Suspense>
    </StickyBox>
  </aside>
);

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export default Layout;
