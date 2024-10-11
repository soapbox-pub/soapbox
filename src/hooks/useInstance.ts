import { useMemo } from 'react';

import { useInstanceV1 } from 'soapbox/api/hooks/instance/useInstanceV1';
import { useInstanceV2 } from 'soapbox/api/hooks/instance/useInstanceV2';
import { instanceV2Schema, upgradeInstance } from 'soapbox/schemas/instance';

/** Get the Instance for the current backend. */
export function useInstance() {
  const v2 = useInstanceV2();
  const v1 = useInstanceV1({ enabled: v2.isError });

  const upgradedV1 = useMemo(() => {
    if (v1.instance) {
      return upgradeInstance(v1.instance);
    }
  }, [v1.instance]);

  const instance = v2.instance ?? upgradedV1 ?? instanceV2Schema.parse({});
  const props = v2.isError ? v1 : v2;

  return { ...props, instance };
}
