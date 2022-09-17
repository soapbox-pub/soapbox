import React from 'react';

import BundleContainer from 'soapbox/features/ui/containers/bundle_container';
import { ScheduleForm } from 'soapbox/features/ui/util/async-components';

import type { IScheduleForm } from '../components/schedule_form';

const ScheduleFormContainer: React.FC<IScheduleForm> = (props) => (
  <BundleContainer fetchComponent={ScheduleForm}>
    {Component => <Component {...props} />}
  </BundleContainer>
);

export default ScheduleFormContainer;
