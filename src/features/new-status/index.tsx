import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import { openModal } from '@/actions/modals.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

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
