import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { useAccount } from 'soapbox/api/hooks/index.ts';
import { Card, CardBody, CardTitle } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import VerificationBadge from 'soapbox/components/verification-badge.tsx';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useSuggestions } from 'soapbox/queries/suggestions.ts';
import { emojifyText } from 'soapbox/utils/emojify.tsx';

import ActionButton from '../ui/components/action-button.tsx';
import { HotKeys } from '../ui/components/hotkeys.tsx';

const messages = defineMessages({
  heading: { id: 'feed_suggestions.heading', defaultMessage: 'Suggested Profiles' },
  viewAll: { id: 'feed_suggestions.view_all', defaultMessage: 'View all' },
});

interface ISuggestionItem {
  accountId: string;
}

const SuggestionItem: React.FC<ISuggestionItem> = ({ accountId }) => {
  const { account } = useAccount(accountId);
  if (!account) return null;

  return (
    <Stack space={3} className='w-52 shrink-0 rounded-md border border-solid border-gray-300 p-4 dark:border-gray-800 md:w-full md:shrink md:border-transparent md:p-0 dark:md:border-transparent'>
      <Link
        to={`/@${account.acct}`}
        title={account.acct}
      >
        <Stack space={3} className='mx-auto w-40 md:w-24'>
          <img
            src={account.avatar}
            className='mx-auto block size-16 min-w-[56px] rounded-full object-cover'
            alt={account.acct}
          />

          <Stack>
            <HStack alignItems='center' justifyContent='center' space={1}>
              <Text
                weight='semibold'
                truncate
                align='center'
                size='sm'
                className='max-w-[95%]'
              >
                {emojifyText(account.display_name, account.emojis)}
              </Text>

              {account.verified && <VerificationBadge />}
            </HStack>

            <Text theme='muted' align='center' size='sm' truncate>@{account.acct}</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
          </Stack>
        </Stack>
      </Link>

      <div className='text-center'>
        <ActionButton account={account} />
      </div>
    </Stack>
  );
};

interface IFeedSuggestions {
  statusId: string;
  onMoveUp?: (statusId: string, featured?: boolean) => void;
  onMoveDown?: (statusId: string, featured?: boolean) => void;
}

const FeedSuggestions: React.FC<IFeedSuggestions> = ({ statusId, onMoveUp, onMoveDown }) => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: suggestedProfiles, isLoading } = useSuggestions({ local: features.suggestionsLocal });

  if (!isLoading && suggestedProfiles.length === 0) return null;

  const handleHotkeyMoveUp = (e?: KeyboardEvent): void => {
    if (onMoveUp) {
      onMoveUp(statusId);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent): void => {
    if (onMoveDown) {
      onMoveDown(statusId);
    }
  };

  const handlers = {
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
  };

  return (
    <HotKeys handlers={handlers}>
      <Card size='lg' className='focusable space-y-6' tabIndex={0}>
        <HStack justifyContent='between' alignItems='center'>
          <CardTitle title={intl.formatMessage(messages.heading)} />

          <Link
            to='/suggestions'
            className='text-primary-600 hover:underline dark:text-accent-blue'
          >
            {intl.formatMessage(messages.viewAll)}
          </Link>
        </HStack>

        <CardBody>
          <HStack space={4} alignItems='center' className='overflow-x-auto md:space-x-0 lg:overflow-x-hidden'>
            {suggestedProfiles.slice(0, 4).map((suggestedProfile) => (
              <SuggestionItem key={suggestedProfile.account} accountId={suggestedProfile.account} />
            ))}
          </HStack>
        </CardBody>
      </Card>
    </HotKeys>
  );
};

export default FeedSuggestions;
