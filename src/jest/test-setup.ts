import { act } from '@testing-library/react';
import { toast } from 'react-hot-toast';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach, vi } from 'vitest';

import { __clear as clearApiMocks } from '../api/__mocks__/index.ts';

// API mocking
vi.mock('soapbox/api');
afterEach(() => {
  clearApiMocks();
});

// Query mocking
vi.mock('soapbox/queries/client');

// Clear toasts after each test.
afterEach(() => {
  act(() => {
    toast.remove();
  });
});

const intersectionObserverMock = () => ({ observe: () => null, disconnect: () => null });
window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
