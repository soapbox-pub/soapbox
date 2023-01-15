import { storeClosed, storeOpen, storePepeClosed, storePepeOpen } from 'soapbox/jest/mock-stores';
import { renderHook } from 'soapbox/jest/test-helpers';

import { useRegistrationStatus } from '../useRegistrationStatus';

describe('useRegistrationStatus()', () => {
  test('Registrations open', () => {
    const { result } = renderHook(useRegistrationStatus, undefined, storeOpen);

    expect(result.current).toMatchObject({
      isOpen: true,
      pepeEnabled: false,
      pepeOpen: false,
    });
  });

  test('Registrations closed', () => {
    const { result } = renderHook(useRegistrationStatus, undefined, storeClosed);

    expect(result.current).toMatchObject({
      isOpen: false,
      pepeEnabled: false,
      pepeOpen: false,
    });
  });

  test('Registrations closed, Pepe enabled & open', () => {
    const { result } = renderHook(useRegistrationStatus, undefined, storePepeOpen);

    expect(result.current).toMatchObject({
      isOpen: true,
      pepeEnabled: true,
      pepeOpen: true,
    });
  });

  test('Registrations closed, Pepe enabled & closed', () => {
    const { result } = renderHook(useRegistrationStatus, undefined, storePepeClosed);

    expect(result.current).toMatchObject({
      isOpen: false,
      pepeEnabled: true,
      pepeOpen: false,
    });
  });
});
