import React, { Suspense } from 'react';

export interface IBundle<T extends React.ComponentType<any>> {
  fetchComponent: React.LazyExoticComponent<T>;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ onRetry: (props?: IBundle<T>) => void }>;
  children: (component: React.LazyExoticComponent<T>) => React.ReactNode;
  renderDelay?: number;
  onFetch?: () => void;
  onFetchSuccess?: () => void;
  onFetchFail?: (error: any) => void;
}

/** Fetches and renders an async component. */
function Bundle<T extends React.ComponentType<any>>({ fetchComponent, loading: Loading, children }: IBundle<T>) {
  return (
    <Suspense fallback={Loading ? <Loading /> : null}>
      {children(fetchComponent)}
    </Suspense>
  );
}

export default Bundle;
