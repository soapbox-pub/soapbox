import { render } from '@testing-library/react';
import { AxiosError } from 'axios';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { act, screen } from 'soapbox/jest/test-helpers';

function renderApp() {
  const { Toaster } = require('react-hot-toast');
  const toast = require('../toast').default;

  return {
    toast,
    ...render(
      <IntlProvider locale='en'>
        <Toaster />,
      </IntlProvider>,
    ),
  };
}

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
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
    const buildError = (message: string, status: number) => new AxiosError<any>(message, String(status), undefined, null, {
      data: {
        error: message,
      },
      statusText: String(status),
      status,
      headers: {},
      config: {},
    });

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
        const error = new AxiosError();
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