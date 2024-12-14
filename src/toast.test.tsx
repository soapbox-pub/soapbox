import { render } from '@testing-library/react';
import { Toaster } from 'react-hot-toast';
import { IntlProvider } from 'react-intl';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { HTTPError } from 'soapbox/api/HTTPError.ts';
import { MastodonResponse } from 'soapbox/api/MastodonResponse.ts';
import { act, screen } from 'soapbox/jest/test-helpers.tsx';

import toast from './toast.tsx';

function renderApp() {
  return {
    toast,
    ...render(
      <IntlProvider locale='en'>
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        <Toaster />,
      </IntlProvider>,
    ),
  };
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as any).mockClear();
});

afterAll(() => {
  (console.error as any).mockRestore();
});

describe('toasts', () =>{
  it('renders successfully', async() => {
    const { toast } = renderApp();

    act(() => {
      toast.success('hello');
    });

    expect(screen.getByTestId('toast')).toBeInTheDocument();
    expect(screen.getByTestId('toast-message')).toHaveTextContent('hello');
  });

  describe('actionable button', () => {
    it('renders the button', async() => {
      const { toast } = renderApp();

      act(() => {
        toast.success('hello', { action: () => null, actionLabel: 'click me' });
      });

      expect(screen.getByTestId('toast-action')).toHaveTextContent('click me');
    });

    it('does not render the button', async() => {
      const { toast } = renderApp();

      act(() => {
        toast.success('hello');
      });

      expect(screen.queryAllByTestId('toast-action')).toHaveLength(0);
    });
  });

  describe('showAlertForError()', () => {
    const buildError = (message: string, status: number): HTTPError => {
      const request = new Request('http://localhost:3000');

      const response = new MastodonResponse(JSON.stringify({ error: message }), {
        status,
        headers: {
          'Content-type': 'application/json',
        },
      });

      return new HTTPError(response, request);
    };

    describe('with a 502 status code', () => {
      it('renders the correct message', async() => {
        const message = 'The server is down';
        const error = buildError(message, 502);
        const { toast } = renderApp();

        act(() => {
          toast.showAlertForError(error);
        });

        expect(screen.getByTestId('toast')).toBeInTheDocument();
        expect(screen.getByTestId('toast-message')).toHaveTextContent('The server is down');
      });
    });

    describe('with a 404 status code', () => {
      it('renders the correct message', async() => {
        const error = buildError('', 404);
        const { toast } = renderApp();

        act(() => {
          toast.showAlertForError(error);
        });

        expect(screen.queryAllByTestId('toast')).toHaveLength(0);
      });
    });

    describe('with a 410 status code', () => {
      it('renders the correct message', async() => {
        const error = buildError('', 410);
        const { toast } = renderApp();

        act(() => {
          toast.showAlertForError(error);
        });

        expect(screen.queryAllByTestId('toast')).toHaveLength(0);
      });
    });

    describe('with an accepted status code', () => {
      describe('with a message from the server', () => {
        it('renders the correct message', async() => {
          const message = 'custom message';
          const error = buildError(message, 200);
          const { toast } = renderApp();

          act(() => {
            toast.showAlertForError(error);
          });

          expect(screen.getByTestId('toast')).toBeInTheDocument();
          expect(screen.getByTestId('toast-message')).toHaveTextContent(message);
        });
      });

      describe('without a message from the server', () => {
        it('renders the correct message', async() => {
          const message = 'The request has been accepted for processing';
          const error = buildError(message, 202);
          const { toast } = renderApp();

          act(() => {
            toast.showAlertForError(error);
          });

          expect(screen.getByTestId('toast')).toBeInTheDocument();
          expect(screen.getByTestId('toast-message')).toHaveTextContent(message);
        });
      });
    });

    describe('without a response', () => {
      it('renders the default message', async() => {
        const error = new HTTPError(new MastodonResponse(null), new Request('http://localhost:3000'));
        const { toast } = renderApp();

        act(() => {
          toast.showAlertForError(error);
        });

        expect(screen.getByTestId('toast')).toBeInTheDocument();
        expect(screen.getByTestId('toast-message')).toHaveTextContent('An unexpected error occurred.');
      });
    });
  });
});