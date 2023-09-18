import L from 'leaflet';
import React, { useCallback, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Modal, Stack } from 'soapbox/components/ui';
import { useAppSelector, useSoapboxConfig } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import type { Status as StatusEntity } from 'soapbox/types/entities';

import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface IEventMapModal {
  onClose: (type: string) => void
  statusId: string
}

const EventMapModal: React.FC<IEventMapModal> = ({ onClose, statusId }) => {
  const { tileServer, tileServerAttribution } = useSoapboxConfig();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id: statusId })) as StatusEntity;
  const location = status.event!.location!;

  const map = useRef<L.Map>();

  useEffect(() => {
    const latlng: [number, number] = [+location.get('latitude'), +location.get('longitude')];

    map.current = L.map('event-map').setView(latlng, 15);

    L.marker(latlng, {
      title: location.get('name'),
    }).addTo(map.current);

    L.tileLayer(tileServer, {
      attribution: tileServerAttribution,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, []);

  const onClickClose = () => {
    onClose('EVENT_MAP');
  };

  const onClickNavigate = () => {
    window.open(`https://www.openstreetmap.org/directions?from=&to=${location.get('latitude')},${location.get('longitude')}#map=14/${location.get('latitude')}/${location.get('longitude')}`, '_blank');
  };

  return (
    <Modal
      title={<FormattedMessage id='column.event_map' defaultMessage='Event location' />}
      onClose={onClickClose}
      width='2xl'
    >
      <Stack alignItems='center' space={6}>
        <div className='h-96 w-full' id='event-map' />
        <Button onClick={onClickNavigate} icon={require('@tabler/icons/gps.svg')}>
          <FormattedMessage id='event_map.navigate' defaultMessage='Navigate' />
        </Button>
      </Stack>
    </Modal>
  );
};

export default EventMapModal;
