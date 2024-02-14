import React from 'react';
import { Motion, MotionProps } from 'react-motion';

import { useSettings } from 'soapbox/hooks';

import ReducedMotion from './reduced-motion';

const OptionalMotion = (props: MotionProps) => {
  const { reduceMotion } = useSettings();

  return (
    reduceMotion ? <ReducedMotion {...props} /> : <Motion {...props} />
  );
};

export default OptionalMotion;
