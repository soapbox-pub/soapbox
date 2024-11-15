import { connect } from 'react-redux';

import { uploadCompose } from 'soapbox/actions/compose.ts';

import UploadButton from '../components/upload-button.tsx';

import type { IntlShape } from 'react-intl';
import type { AppDispatch, RootState } from 'soapbox/store.ts';

const mapStateToProps = (state: RootState, { composeId }: { composeId: string }) => ({
  disabled: state.compose.get(composeId)?.is_uploading,
  resetFileKey: state.compose.get(composeId)?.resetFileKey!,
});

const mapDispatchToProps = (dispatch: AppDispatch, { composeId }: { composeId: string }) => ({

  onSelectFile(files: FileList, intl: IntlShape) {
    dispatch(uploadCompose(composeId, files, intl));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
