interface ILogoText extends Pick<React.HTMLAttributes<HTMLHeadingElement>, 'dir'> {
  children: React.ReactNode;
}

/** Big text in site colors, for displaying the site name. Resizes itself according to the screen size. */
const LogoText: React.FC<ILogoText> = ({ children, dir }) => {
  return (
    <h1
      className='-my-5 overflow-hidden text-ellipsis bg-gradient-to-br from-accent-500 via-primary-500 to-gradient-end bg-clip-text text-5xl font-extrabold !leading-normal text-transparent lg:text-6xl xl:text-7xl'
      dir={dir}
    >
      {children}
    </h1>
  );
};

export { LogoText };