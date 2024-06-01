import { useScreenWidth } from './useScreenWidth';

export function useIsMobile() {
  const screenWidth = useScreenWidth();
  return screenWidth <= 581;
}