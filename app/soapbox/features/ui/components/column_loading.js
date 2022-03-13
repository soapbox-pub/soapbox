import React from 'react';

import LoadingIndicator from 'soapbox/components/loading_indicator';
import { Card, CardBody } from 'soapbox/components/ui';

const ColumnLoading = () => (
  <Card variant='rounded'>
    <CardBody>
      <LoadingIndicator />
    </CardBody>
  </Card>
);

export default ColumnLoading;
