import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchPoll, vote } from 'soapbox/actions/polls.ts';
import RelativeTimestamp from 'soapbox/components/relative-timestamp.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import type { Poll as PollEntity } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  closed: { id: 'poll.closed', defaultMessage: 'Closed' },
  nonAnonymous: { id: 'poll.non_anonymous.label', defaultMessage: 'Other instances may display the options you voted for' },
});

interface IPollFooter {
  poll: PollEntity;
  showResults: boolean;
  selected: Record<number, boolean>;
}

const PollFooter: React.FC<IPollFooter> = ({ poll, showResults, selected }): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleVote = () => dispatch(vote(poll.id, Object.keys(selected)));

  const handleRefresh: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(fetchPoll(poll.id));
    e.stopPropagation();
    e.preventDefault();
  };

  const timeRemaining = poll.expires_at && (
    poll.expired ?
      intl.formatMessage(messages.closed) :
      <RelativeTimestamp weight='medium' timestamp={poll.expires_at} futureDate />
  );

  let votesCount = null;

  if (poll.voters_count !== null && poll.voters_count !== undefined) {
    votesCount = <FormattedMessage id='poll.total_people' defaultMessage='{count, plural, one {# person} other {# people}}' values={{ count: poll.voters_count }} />;
  } else {
    votesCount = <FormattedMessage id='poll.total_votes' defaultMessage='{count, plural, one {# vote} other {# votes}}' values={{ count: poll.votes_count }} />;
  }

  return (
    <Stack space={4} data-testid='poll-footer'>
      {(!showResults && poll.multiple) && (
        <Button onClick={handleVote} theme='primary' block>
          <FormattedMessage id='poll.vote' defaultMessage='Submit Vote' />
        </Button>
      )}

      <HStack space={1.5} alignItems='center' wrap>
        {poll.pleroma?.non_anonymous && (
          <>
            <Tooltip text={intl.formatMessage(messages.nonAnonymous)}>
              <Text theme='muted' weight='medium'>
                <FormattedMessage id='poll.non_anonymous' defaultMessage='Public poll' />
              </Text>
            </Tooltip>

            <Text theme='muted'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
          </>
        )}

        {showResults && (
          <>
            <button className='text-gray-600 underline' onClick={handleRefresh} data-testid='poll-refresh'>
              <Text theme='muted' weight='medium'>
                <FormattedMessage id='poll.refresh' defaultMessage='Refresh' />
              </Text>
            </button>

            <Text theme='muted'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
          </>
        )}

        <Text theme='muted' weight='medium'>
          {votesCount}
        </Text>

        {poll.expires_at !== null && (
          <>
            <Text theme='muted'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
            <Text weight='medium' theme='muted' data-testid='poll-expiration'>{timeRemaining}</Text>
          </>
        )}
      </HStack>
    </Stack>
  );
};

export default PollFooter;
