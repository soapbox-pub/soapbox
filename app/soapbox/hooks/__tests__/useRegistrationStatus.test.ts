import { fromJS } from 'immutable';

import { renderHook } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import { useRegistrationStatus } from '../useRegistrationStatus';

describe('useRegistrationStatus()', () => {
  test('Registrations open', () => {
    const store = { instance: normalizeInstance({ registrations: true }) };
    const { result } = renderHook(useRegistrationStatus, undefined, store);

    expect(result.current).toMatchObject({
      isOpen: true,
      pepeEnabled: false,
      pepeOpen: false,
    });
  });

  test('Registrations closed', () => {
    const store = { instance: normalizeInstance({ registrations: false }) };
    const { result } = renderHook(useRegistrationStatus, undefined, store);

    expect(result.current).toMatchObject({
      isOpen: false,
      pepeEnabled: false,
      pepeOpen: false,
    });
  });

  test('Registrations closed, Pepe enabled & open', () => {
    const store = {
      instance: normalizeInstance({ registrations: false }),
      soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
      verification: { instance: fromJS({ registrations: true }) },
    };

    const { result } = renderHook(useRegistrationStatus, undefined, store);

    expect(result.current).toMatchObject({
      isOpen: true,
      pepeEnabled: true,
      pepeOpen: true,
    });
  });

  test('Registrations closed, Pepe enabled & closed', () => {
    const store = {
      instance: normalizeInstance({ registrations: false }),
      soapbox: fromJS({ extensions: { pepe: { enabled: true } } }),
      verification: { instance: fromJS({ registrations: false }) },
    };

    const { result } = renderHook(useRegistrationStatus, undefined, store);

    expect(result.current).toMatchObject({
      isOpen: false,
      pepeEnabled: true,
      pepeOpen: false,
    });
  });
});
