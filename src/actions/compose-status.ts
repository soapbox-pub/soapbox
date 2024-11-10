import { AppDispatch, RootState } from 'soapbox/store.ts';
import { getFeatures, parseVersion } from 'soapbox/utils/features.ts';

import type { Status } from 'soapbox/types/entities.ts';

export const COMPOSE_SET_STATUS = 'COMPOSE_SET_STATUS' as const;

export interface ComposeSetStatusAction {
  type: typeof COMPOSE_SET_STATUS;
  id: string;
  status: Status;
  rawText: string;
  explicitAddressing: boolean;
  spoilerText?: string;
  contentType?: string | false;
  v: ReturnType<typeof parseVersion>;
  withRedraft?: boolean;
}

export const setComposeToStatus = (status: Status, rawText: string, spoilerText?: string, contentType?: string | false, withRedraft?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { instance } = getState();
    const { explicitAddressing } = getFeatures(instance);

    const action: ComposeSetStatusAction = {
      type: COMPOSE_SET_STATUS,
      id: 'compose-modal',
      status,
      rawText,
      explicitAddressing,
      spoilerText,
      contentType,
      v: parseVersion(instance.version),
      withRedraft,
    };

    dispatch(action);
  };