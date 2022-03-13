import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { openModal } from 'soapbox/actions/modals';

import { Button } from '../../../components/ui';

const mapDispatchToProps = (dispatch) => ({
  onOpenCompose() {
    dispatch(openModal('COMPOSE'));
  },
});

const ComposeButton = ({ onOpenCompose }) => (
  <div className='mt-4'>
    <Button icon={require('icons/compose.svg')} block size='lg' onClick={onOpenCompose}>
      <span><FormattedMessage id='navigation.compose' defaultMessage='Compose' /></span>
    </Button>
  </div>
);

ComposeButton.propTypes = {
  onOpenCompose: PropTypes.func,
};

export default connect(null, mapDispatchToProps)(ComposeButton);
