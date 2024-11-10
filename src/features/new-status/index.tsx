import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals.ts';
import { useAppDispatch } from 'soapbox/hooks/index.ts';

const NewStatus = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openModal('COMPOSE'));
  }, []);

  return (
    <Redirect to='/' />
  );
};

export default NewStatus;
