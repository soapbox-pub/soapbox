import { Motion, MotionProps } from 'react-motion';

import { useSettings } from 'soapbox/hooks/index.ts';

import ReducedMotion from './reduced-motion.tsx';

const OptionalMotion = (props: MotionProps) => {
  const { reduceMotion } = useSettings();

  return (
    reduceMotion ? <ReducedMotion {...props} /> : <Motion {...props} />
  );
};

export default OptionalMotion;
