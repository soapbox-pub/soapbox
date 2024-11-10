import { useEffect, useMemo } from 'react';

import { HTTPError } from 'soapbox/api/HTTPError.ts';
import { useInstanceV1 } from 'soapbox/api/hooks/instance/useInstanceV1.ts';
import { useInstanceV2 } from 'soapbox/api/hooks/instance/useInstanceV2.ts';
import { instanceV2Schema, upgradeInstance } from 'soapbox/schemas/instance.ts';

import { useAppDispatch } from './useAppDispatch.ts';

interface Opts {
  /** The base URL of the instance. */
  baseUrl?: string;
  enabled?: boolean;
  retryOnMount?: boolean;
  staleTime?: number;
}

/** Get the Instance for the current backend. */
export function useInstance(opts: Opts = {}) {
  const { baseUrl, retryOnMount = false, staleTime = Infinity } = opts;

  const v2 = useInstanceV2({ baseUrl, retryOnMount, staleTime });
  const v1 = useInstanceV1({ baseUrl, retryOnMount, staleTime, enabled: v2.isError });

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
