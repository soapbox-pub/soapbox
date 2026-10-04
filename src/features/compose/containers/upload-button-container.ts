import { connect } from 'react-redux';

import { uploadCompose } from '@/actions/compose.ts';

import UploadButton from '../components/upload-button.tsx';

import type { AppDispatch, RootState } from '@/store.ts';
import type { IntlShape } from 'react-intl';

const mapStateToProps = (state: RootState, { composeId }: { composeId: string }) => ({
  disabled: state.compose[composeId]?.is_uploading,
  resetFileKey: state.compose[composeId]?.resetFileKey!,
});

const mapDispatchToProps = (dispatch: AppDispatch, { composeId }: { composeId: string }) => ({

  onSelectFile(files: FileList, intl: IntlShape) {
    dispatch(uploadCompose(composeId, files, intl));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
