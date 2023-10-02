import React from 'react';

interface ILogoText {
  children: React.ReactNode;
}

/** Big text in site colors, for displaying the site name. Resizes itself according to the screen size. */
const LogoText: React.FC<ILogoText> = ({ children }) => {
  return (
    <h1 className='overflow-hidden text-ellipsis bg-gradient-to-br from-accent-500 via-primary-500 to-gradient-end bg-clip-text text-5xl font-extrabold text-transparent sm:leading-none lg:text-6xl xl:text-7xl'>
      {children}
    </h1>
  );
};

export { LogoText };