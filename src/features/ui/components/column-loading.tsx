import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';

const ColumnLoading = () => (
  <Card>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export default ColumnLoading;
