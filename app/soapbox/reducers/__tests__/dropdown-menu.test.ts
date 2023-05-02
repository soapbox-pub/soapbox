import reducer from '../dropdown-menu';

describe('dropdown_menu reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      isOpen: false,
    });
  });
});
