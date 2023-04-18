type HOC<P, R> = (Component: React.ComponentType<P>) => React.ComponentType<R>
type AsyncComponent<P> = () => Promise<{ default: React.ComponentType<P> }>

const withHoc = <P, R>(asyncComponent: AsyncComponent<P>, hoc: HOC<P, R>) => {
  return async () => {
    const { default: component } = await asyncComponent();
    return { default: hoc(component) };
  };
};

export default withHoc;