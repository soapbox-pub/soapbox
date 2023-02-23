import React from 'react';

const emptyComponent = () => null;
const noop = () => { };

export interface BundleProps {
  fetchComponent: () => Promise<any>
  loading: React.ComponentType
  error: React.ComponentType<{ onRetry: (props?: BundleProps) => void }>
  children: (mod: any) => React.ReactNode
  renderDelay?: number
  onFetch: () => void
  onFetchSuccess: () => void
  onFetchFail: (error: any) => void
}

interface BundleState {
  mod: any
  forceRender: boolean
}

/** Fetches and renders an async component. */
class Bundle extends React.PureComponent<BundleProps, BundleState> {

  timeout: NodeJS.Timeout | undefined;
  timestamp: Date | undefined;

  static defaultProps = {
    loading: emptyComponent,
    error: emptyComponent,
    renderDelay: 0,
    onFetch: noop,
    onFetchSuccess: noop,
    onFetchFail: noop,
  };

  static cache = new Map;

  state = {
    mod: undefined,
    forceRender: false,
  };

  componentDidMount() {
    this.load(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps: BundleProps) {
    if (nextProps.fetchComponent !== this.props.fetchComponent) {
      this.load(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  load = (props?: BundleProps) => {
    const { fetchComponent, onFetch, onFetchSuccess, onFetchFail, renderDelay } = props || this.props;
    const cachedMod = Bundle.cache.get(fetchComponent);

    if (fetchComponent === undefined) {
      this.setState({ mod: null });
      return Promise.resolve();
    }

    onFetch();

    if (cachedMod) {
      this.setState({ mod: cachedMod.default });
      onFetchSuccess();
      return Promise.resolve();
    }

    this.setState({ mod: undefined });

    if (renderDelay !== 0) {
      this.timestamp = new Date();
      this.timeout = setTimeout(() => this.setState({ forceRender: true }), renderDelay);
    }

    return fetchComponent()
      .then((mod) => {
        Bundle.cache.set(fetchComponent, mod);
        this.setState({ mod: mod.default });
        onFetchSuccess();
      })
      .catch((error) => {
        this.setState({ mod: null });
        onFetchFail(error);
      });
  };

  render() {
    const { loading: Loading, error: Error, children, renderDelay } = this.props;
    const { mod, forceRender } = this.state;
    const elapsed = this.timestamp ? ((new Date()).getTime() - this.timestamp.getTime()) : renderDelay!;

    if (mod === undefined) {
      return (elapsed >= renderDelay! || forceRender) ? <Loading /> : null;
    }

    if (mod === null) {
      return <Error onRetry={this.load} />;
    }

    return children(mod);
  }

}

export default Bundle;
