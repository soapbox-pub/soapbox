import { Card, CardBody, Spinner } from 'soapbox/components/ui/index.ts';

const ColumnLoading = () => (
  <Card variant='rounded'>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export default ColumnLoading;
