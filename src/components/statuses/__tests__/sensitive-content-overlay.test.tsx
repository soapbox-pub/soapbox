import { Map as ImmutableMap } from 'immutable';
import React from 'react';

import { normalizeStatus } from 'soapbox/normalizers';
import { ReducerStatus } from 'soapbox/reducers/statuses';

import { fireEvent, render, rootState, screen } from '../../../jest/test-helpers';
import SensitiveContentOverlay from '../sensitive-content-overlay';

describe('<SensitiveContentOverlay />', () => {
  let status: ReducerStatus;

  describe('when the Status is marked as sensitive', () => {
    beforeEach(() => {
      status = normalizeStatus({ sensitive: true }) as ReducerStatus;
    });

    it('displays the "Sensitive content" warning', () => {
      render(<SensitiveContentOverlay status={status} />);
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Sensitive content');
    });

    it('does not allow user to delete the status', () => {
      render(<SensitiveContentOverlay status={status} />);
      expect(screen.queryAllByTestId('icon-button')).toHaveLength(0);
    });

    it('can be toggled', () => {
      render(<SensitiveContentOverlay status={status} />);

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Sensitive content');
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Hide');

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Sensitive content');
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Hide');
    });
  });

  describe('when the Status is marked as in review', () => {
    beforeEach(() => {
      status = normalizeStatus({ visibility: 'self', sensitive: false }) as ReducerStatus;
    });

    it('displays the "Under review" warning', () => {
      render(<SensitiveContentOverlay status={status} />);
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Content Under Review');
    });

    it('allows the user to delete the status', () => {
      render(<SensitiveContentOverlay status={status} />);
      expect(screen.getByTestId('icon-button')).toBeInTheDocument();
    });

    it('can be toggled', () => {
      render(<SensitiveContentOverlay status={status} />);

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Content Under Review');
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Hide');

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Content Under Review');
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Hide');
    });
  });

  describe('when the Status is marked as in review and sensitive', () => {
    beforeEach(() => {
      status = normalizeStatus({ visibility: 'self', sensitive: true }) as ReducerStatus;
    });

    it('displays the "Under review" warning', () => {
      render(<SensitiveContentOverlay status={status} />);
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Content Under Review');
    });

    it('can be toggled', () => {
      render(<SensitiveContentOverlay status={status} />);

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Content Under Review');
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Hide');

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Content Under Review');
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Hide');
    });
  });

  describe('when the Status is marked as sensitive and displayMedia set to "show_all"', () => {
    let store: any;

    beforeEach(() => {
      status = normalizeStatus({ sensitive: true }) as ReducerStatus;
      store = rootState
        .set('settings', ImmutableMap({
          displayMedia: 'show_all',
        }));
    });

    it('displays the "Under review" warning', () => {
      render(<SensitiveContentOverlay status={status} />, undefined, store);
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Sensitive content');
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Hide');
    });

    it('can be toggled', () => {
      render(<SensitiveContentOverlay status={status} />, undefined, store);

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Sensitive content');
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Hide');

      fireEvent.click(screen.getByTestId('button'));
      expect(screen.getByTestId('sensitive-overlay')).not.toHaveTextContent('Sensitive content');
      expect(screen.getByTestId('sensitive-overlay')).toHaveTextContent('Hide');
    });
  });
});
