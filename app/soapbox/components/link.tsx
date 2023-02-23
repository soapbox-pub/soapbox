import React from 'react';
import { Link as Comp, LinkProps } from 'react-router-dom';

const Link = (props: LinkProps) => (
  <Comp
    {...props}
    className='text-primary-600 hover:underline dark:text-accent-blue'
  />
);

export default Link;