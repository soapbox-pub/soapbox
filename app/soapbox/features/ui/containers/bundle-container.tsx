import { connect } from 'react-redux';

import { fetchBundleRequest, fetchBundleSuccess, fetchBundleFail } from 'soapbox/actions/bundles';

import Bundle from '../components/bundle';

import type { AppDispatch } from 'soapbox/store';

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onFetch() {
    dispatch(fetchBundleRequest());
  },
  onFetchSuccess() {
    dispatch(fetchBundleSuccess());
  },
  onFetchFail(error: any) {
    dispatch(fetchBundleFail(error));
  },
});

export default connect(null, mapDispatchToProps)(Bundle);
