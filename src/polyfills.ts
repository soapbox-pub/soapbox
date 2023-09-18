import 'intersection-observer';
import ResizeObserver from 'resize-observer-polyfill';

// Needed by Virtuoso
// https://github.com/petyosi/react-virtuoso#browser-support
if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}