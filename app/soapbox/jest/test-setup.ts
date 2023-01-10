'use strict';

import { act } from '@testing-library/react';
import { toast } from 'react-hot-toast';

import { __clear as clearApiMocks } from '../api/__mocks__';

// API mocking
jest.mock('soapbox/api');
afterEach(() => clearApiMocks());

// Query mocking
jest.mock('soapbox/queries/client');

// Mock IndexedDB
// https://dev.to/andyhaskell/testing-your-indexeddb-code-with-jest-2o17
require('fake-indexeddb/auto');

// Clear toasts after each test.
afterEach(() => {
  act(() => {
    toast.remove();
  });
});

const intersectionObserverMock = () => ({ observe: () => null, disconnect: () => null });
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
