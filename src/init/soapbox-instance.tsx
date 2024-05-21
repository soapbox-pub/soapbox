import React, { useEffect, useState } from 'react';

import { fetchInstance } from 'soapbox/actions/instance';
import { useSignerStream } from 'soapbox/api/hooks/nostr/useSignerStream';
import LoadingScreen from 'soapbox/components/loading-screen';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';

interface ISoapboxInstance {
  children: React.ReactNode;
}

const SoapboxInstance: React.FC<ISoapboxInstance> = ({ children }) => {
  const features = useFeatures();
  const dispatch = useAppDispatch();

  const [isLoaded, setIsLoaded] = useState(false);
  const { opened } = useSignerStream();

  useEffect(() => {
    dispatch(fetchInstance()).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded || (!opened && features.nostr)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default SoapboxInstance;