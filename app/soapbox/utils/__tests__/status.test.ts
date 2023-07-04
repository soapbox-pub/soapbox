
import { buildStatus } from 'soapbox/jest/factory';

import {
  hasIntegerMediaIds,
  defaultMediaVisibility,
} from '../status';

describe('hasIntegerMediaIds()', () => {
  it('returns true for a Pleroma deleted status', () => {
    const status = buildStatus(require('soapbox/__fixtures__/pleroma-status-deleted.json'));
    expect(hasIntegerMediaIds(status)).toBe(true);
  });
});

describe('defaultMediaVisibility()', () => {
  it('returns false with no status', () => {
    expect(defaultMediaVisibility(undefined, 'default')).toBe(false);
  });

  it('hides sensitive media by default', () => {
    const status = buildStatus({ sensitive: true });
    expect(defaultMediaVisibility(status, 'default')).toBe(false);
  });

  it('hides media when displayMedia is hide_all', () => {
    const status = buildStatus({});
    expect(defaultMediaVisibility(status, 'hide_all')).toBe(false);
  });

  it('shows sensitive media when displayMedia is show_all', () => {
    const status = buildStatus({ sensitive: true });
    expect(defaultMediaVisibility(status, 'show_all')).toBe(true);
  });
});
