import { UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { HTTPError } from 'soapbox/api/HTTPError';
import { useInstanceV1 } from 'soapbox/api/hooks/instance/useInstanceV1';
import { useInstanceV2 } from 'soapbox/api/hooks/instance/useInstanceV2';
import { instanceV2Schema, upgradeInstance } from 'soapbox/schemas/instance';

import { useAppDispatch } from './useAppDispatch';

interface Opts extends Pick<UseQueryOptions<unknown>, 'enabled' | 'retryOnMount'> {
  /** The base URL of the instance. */
  baseUrl?: string;
}

/** Get the Instance for the current backend. */
export function useInstance(opts: Opts = {}) {
  const { baseUrl, retryOnMount = false } = opts;

  function retry(failureCount: number, error: Error): boolean {
    if (error instanceof HTTPError && error.response.status === 404) {
      return false;
    } else {
      return failureCount < 3;
    }
  }

  const v2 = useInstanceV2({ baseUrl, retry, retryOnMount });
  const v1 = useInstanceV1({ baseUrl, retry, retryOnMount, enabled: v2.isError });

  const instance = useMemo(() => {
    if (v2.instance) {
      return v2.instance;
    } if (v1.instance) {
      return upgradeInstance(v1.instance);
    } else {
      return instanceV2Schema.parse({});
    }
  }, [v2.instance, v1.instance]);

  const props = v2.isError ? v1 : v2;
  const isNotFound = props.error instanceof HTTPError && props.error.response.status === 404;

  // HACK: store the instance in Redux for legacy code
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch({
      type: 'instanceV2/fetch/fulfilled',
      payload: { instance },
    });
  }, [instance]);

  return { ...props, instance, isNotFound };
}
