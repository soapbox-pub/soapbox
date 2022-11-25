import React from 'react';

import HStack from '../hstack/hstack';

/** Container element to house form actions. */
const FormActions: React.FC = ({ children }) => (
  <HStack space={2} justifyContent='end'>
    {children}
  </HStack>
);

export default FormActions;
