export const findGroup = (state, param) => {
  const groups = state.get('groups');
  return state.getIn(['groups', param]) || groups.find(g => g.get('slug') === param);
};
