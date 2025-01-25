import { FormattedMessage } from 'react-intl';

import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';

interface MissingIndicatorProps {
  nested?: boolean;
}

const MissingIndicator = ({ nested = false }: MissingIndicatorProps): JSX.Element => (
  <Card rounded={!nested} size='lg'>
    <CardBody>
      <Stack space={2}>
        <Text weight='medium' align='center' size='lg'>
          <FormattedMessage id='missing_indicator.label' tagName='strong' defaultMessage='Not found' />
        </Text>

        <Text theme='muted' align='center'>
          <FormattedMessage id='missing_indicator.sublabel' defaultMessage='This resource could not be found' />
        </Text>
      </Stack>
    </CardBody>
  </Card>
);

export default MissingIndicator;
