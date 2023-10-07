import React from 'react';

import { Spinner } from 'soapbox/components/ui';

const ModalLoading = () => (
  <div className='modal-root__modal error-modal'>
    <div className='error-modal__body'>
      <Spinner />
    </div>
    <div className='error-modal__footer'>
      <div>
        <button className='error-modal__nav' />
      </div>
    </div>
  </div>
);

export default ModalLoading;
