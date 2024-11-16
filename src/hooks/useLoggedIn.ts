import { useAppSelector } from './useAppSelector.ts';

function useLoggedIn() {
  const me = useAppSelector(state => state.me);
  return {
    isLoggedIn: typeof me === 'string',
    isLoginLoading: me === null,
    isLoginFailed: me === false,
    me,
  };
}

export { useLoggedIn };