import { Card, CardBody } from '@/components/ui/card.tsx';
import Spinner from '@/components/ui/spinner.tsx';

const ColumnLoading = () => (
  <Card>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export default ColumnLoading;
