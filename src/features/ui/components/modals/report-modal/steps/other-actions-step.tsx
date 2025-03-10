import arrowsMinimizeIcon from '@tabler/icons/outline/arrows-minimize.svg';
import plusIcon from '@tabler/icons/outline/plus.svg';
import { OrderedSet } from 'immutable';
import { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeReportBlock, changeReportForward } from 'soapbox/actions/reports.ts';
import Button from 'soapbox/components/ui/button.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Toggle from 'soapbox/components/ui/toggle.tsx';
import StatusCheckBox from 'soapbox/features/report/components/status-check-box.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { getDomain } from 'soapbox/utils/accounts.ts';

import type { Account } from 'soapbox/schemas/index.ts';

const messages = defineMessages({
  addAdditionalStatuses: { id: 'report.other_actions.add_additional', defaultMessage: 'Would you like to add additional statuses to this report?' },
  addMore: { id: 'report.other_actions.add_more', defaultMessage: 'Add more' },
  furtherActions: { id: 'report.other_actions.further_actions', defaultMessage: 'Further actions:' },
  hideAdditionalStatuses: { id: 'report.other_actions.hide_additional', defaultMessage: 'Hide additional statuses' },
  otherStatuses: { id: 'report.other_actions.other_statuses', defaultMessage: 'Include other statuses?' },
});

interface IOtherActionsStep {
  account: Account;
}

const OtherActionsStep = ({ account }: IOtherActionsStep) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const statusIds = useAppSelector((state) => OrderedSet(state.timelines.get(`account:${account.id}:with_replies`)!.items).union(state.reports.new.status_ids) as OrderedSet<string>);
  const isBlocked = useAppSelector((state) => state.reports.new.block);
  const isForward = useAppSelector((state) => state.reports.new.forward);
  const canForward = !account.local && features.federating;
  const isSubmitting = useAppSelector((state) => state.reports.new.isSubmitting);

  const [showAdditionalStatuses, setShowAdditionalStatuses] = useState<boolean>(false);

  const handleBlockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeReportBlock(event.target.checked));
  };

  const handleForwardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeReportForward(event.target.checked));
  };

  return (
    <Stack space={4}>
      {features.reportMultipleStatuses && (
        <Stack space={2}>
          <Text tag='h1' size='xl' weight='semibold'>
            {intl.formatMessage(messages.otherStatuses)}
          </Text>

          <FormGroup labelText={intl.formatMessage(messages.addAdditionalStatuses)}>
            {showAdditionalStatuses ? (
              <Stack space={2}>
                <div className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'>
                  {statusIds.map((statusId) => <StatusCheckBox id={statusId} key={statusId} />)}
                </div>

                <div>
                  <Button
                    icon={arrowsMinimizeIcon}
                    theme='tertiary'
                    size='sm'
                    onClick={() => setShowAdditionalStatuses(false)}
                  >
                    {intl.formatMessage(messages.hideAdditionalStatuses)}
                  </Button>
                </div>
              </Stack>
            ) : (
              <Button
                icon={plusIcon}
                theme='tertiary'
                size='sm'
                onClick={() => setShowAdditionalStatuses(true)}
              >
                {intl.formatMessage(messages.addMore)}
              </Button>
            )}
          </FormGroup>
        </Stack>
      )}

      <Stack space={2}>
        <Text tag='h1' size='xl' weight='semibold'>
          {intl.formatMessage(messages.furtherActions)}
        </Text>

        <FormGroup
          labelText={<FormattedMessage id='report.block_hint' defaultMessage='Do you also want to block this account?' />}
        >
          <HStack space={2} alignItems='center'>
            <Toggle
              checked={isBlocked}
              onChange={handleBlockChange}
              id='report-block'
            />

            <Text theme='muted' tag='label' size='sm' htmlFor='report-block'>
              <FormattedMessage id='report.block' defaultMessage='Block {target}' values={{ target: `@${account.acct}` }} />
            </Text>
          </HStack>
        </FormGroup>

        {canForward && (
          <FormGroup
            labelText={<FormattedMessage id='report.forward_hint' defaultMessage='The account is from another server. Send a copy of the report there as well?' />}
          >
            <HStack space={2} alignItems='center'>
              <Toggle
                checked={isForward}
                onChange={handleForwardChange}
                id='report-forward'
                disabled={isSubmitting}
              />

              <Text theme='muted' tag='label' size='sm' htmlFor='report-forward'>
                <FormattedMessage id='report.forward' defaultMessage='Forward to {target}' values={{ target: getDomain(account) }} />
              </Text>
            </HStack>
          </FormGroup>
        )}
      </Stack>
    </Stack>
  );
};

export default OtherActionsStep;
