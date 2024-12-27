if (!Promise.withResolvers) {
  Promise.withResolvers = function withResolvers<T>(): PromiseWithResolvers<T> {

    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    const promise = new this<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    return { resolve: resolve!, reject: reject!, promise };
  };
}