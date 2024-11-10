import { useScreenWidth } from './useScreenWidth.ts';

export function useIsMobile() {
  const screenWidth = useScreenWidth();
  return screenWidth <= 581;
}