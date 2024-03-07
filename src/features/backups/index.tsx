import React, { useEffect, useState } from 'react';
import { FormattedDate, defineMessages, useIntl } from 'react-intl';

import { fetchBackups, createBackup } from 'soapbox/actions/backups';
import { Button, Card, Column, FormActions, HStack, Spinner, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import type { Backup as BackupEntity } from 'soapbox/reducers/backups';

const messages = defineMessages({
  heading: { id: 'column.backups', defaultMessage: 'Backups' },
  create: { id: 'backups.actions.create', defaultMessage: 'Create backup' },
  emptyMessage: { id: 'backups.empty_message', defaultMessage: 'No backups found. {action}' },
  emptyMessageAction: { id: 'backups.empty_message.action', defaultMessage: 'Create one now?' },
  download: { id: 'backups.download', defaultMessage: 'Download' },
  pending: { id: 'backups.pending', defaultMessage: 'Pending' },
});

interface IBackup {
  backup: BackupEntity;
}

const Backup: React.FC<IBackup> = ({ backup }) => {
  const intl = useIntl();

  const button = (
    <Button theme='primary' disabled={!backup.processed}>
      {intl.formatMessage(backup.processed ? messages.download : messages.pending)}
    </Button>
  );

  return (
    <div key={backup.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <Stack space={2}>
        <Stack>
          <Text size='md'>
            <FormattedDate
              value={backup.inserted_at}
              hour12
              year='numeric'
              month='short'
              day='2-digit'
              hour='numeric'
              minute='2-digit'
            />
          </Text>
        </Stack>
        <HStack justifyContent='end'>
          {backup.processed ? <a href={backup.url} target='_blank'>{button}</a> : button}
        </HStack>
      </Stack>
    </div>
  );
};

const Backups = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const backups = useAppSelector((state) => state.backups.toList().sortBy((backup) => backup.inserted_at));

  const [isLoading, setIsLoading] = useState(true);

  const handleCreateBackup: React.MouseEventHandler = e => {
    dispatch(createBackup());
    e.preventDefault();
  };

  useEffect(() => {
    dispatch(fetchBackups()).then(() => {
      setIsLoading(false);
    }).catch(() => {});
  }, []);

  const showLoading = isLoading && backups.count() === 0;

  const emptyMessage = (
    <Card variant='rounded' size='lg'>
      {intl.formatMessage(messages.emptyMessage, {
        action: (
          <a href='#' onClick={handleCreateBackup}>
            <Text tag='span' theme='primary' size='sm' className='hover:underline'>
              {intl.formatMessage(messages.emptyMessageAction)}
            </Text>
          </a>
        ),
      })}
    </Card>
  );

  const body = showLoading ? <Spinner /> : backups.isEmpty() ? emptyMessage : (
    <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {backups.map((backup) => <Backup key={backup.id} backup={backup} />)}
    </div>
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {body}

      <FormActions>
        <Button theme='primary' disabled={isLoading} onClick={handleCreateBackup}>
          {intl.formatMessage(messages.create)}
        </Button>
      </FormActions>
    </Column>
  );
};

export default Backups;
