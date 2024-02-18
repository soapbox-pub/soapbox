/** Lock a key from being accessed by `localStorage` and `sessionStorage`. */
function lockStorageKey(key: string): void {
  const proto = Object.getPrototypeOf(localStorage ?? sessionStorage);
  const _getItem = proto.getItem;

  proto.getItem = function(_key: string) {
    if (_key === key) {
      throw new Error(`${_key} is locked`);
    } else {
      return _getItem.bind(this)(_key);
    }
  };
}

export { lockStorageKey };