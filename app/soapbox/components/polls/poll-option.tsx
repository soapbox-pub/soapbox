import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Motion, presets, spring } from 'react-motion';

import { HStack, Icon, Text } from '../ui';

import type {
  Poll as PollEntity,
  PollOption as PollOptionEntity,
} from 'soapbox/types/entities';

const messages = defineMessages({
  voted: { id: 'poll.voted', defaultMessage: 'You voted for this answer' },
  votes: { id: 'poll.votes', defaultMessage: '{votes, plural, one {# vote} other {# votes}}' },
});

const PollPercentageBar: React.FC<{ percent: number, leading: boolean }> = ({ percent, leading }): JSX.Element => {
  return (
    <Motion defaultStyle={{ width: 0 }} style={{ width: spring(percent, { ...presets.gentle, precision: 0.1 }) }}>
      {({ width }) => (
        <span
          className='absolute inset-0 inline-block h-full rounded-l-md bg-primary-100 dark:bg-primary-500'
          style={{ width: `${width}%` }}
        />
      )}
    </Motion>
  );
};

interface IPollOptionText extends IPollOption {
  percent: number
}

const PollOptionText: React.FC<IPollOptionText> = ({ poll, option, index, active, onToggle }) => {
  const handleOptionChange: React.EventHandler<React.ChangeEvent> = () => onToggle(index);

  const handleOptionKeyPress: React.EventHandler<React.KeyboardEvent> = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      onToggle(index);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <label
      className={
        clsx('relative flex cursor-pointer rounded-3xl border border-solid bg-white p-2 hover:bg-primary-50 dark:bg-primary-900 dark:hover:bg-primary-800/50', {
          'border-primary-600 ring-1 ring-primary-600 bg-primary-50 dark:bg-primary-800/50 dark:border-primary-300 dark:ring-primary-300': active,
          'border-primary-300 dark:border-primary-500': !active,
        })
      }
    >
      <input
        className='hidden'
        name='vote-options'
        type={poll.multiple ? 'checkbox' : 'radio'}
        value={index}
        checked={active}
        onChange={handleOptionChange}
      />

      <div className='grid w-full items-center'>
        <div className='col-start-1 row-start-1 ml-4 mr-6 justify-self-center'>
          <div className='text-primary-600 dark:text-white'>
            <Text
              theme='inherit'
              weight='medium'
              dangerouslySetInnerHTML={{ __html: option.title_emojified }}
            />
          </div>
        </div>

        <div className='col-start-1 row-start-1 flex items-center justify-self-end'>
          <span
            className={clsx('flex h-6 w-6 flex-none items-center justify-center rounded-full border border-solid', {
              'bg-primary-600 border-primary-600 dark:bg-primary-300 dark:border-primary-300': active,
              'border-primary-300 bg-white dark:bg-primary-900 dark:border-primary-500': !active,
            })}
            tabIndex={0}
            role={poll.multiple ? 'checkbox' : 'radio'}
            onKeyPress={handleOptionKeyPress}
            aria-checked={active}
            aria-label={option.title}
          >
            {active && (
              <Icon src={require('@tabler/icons/check.svg')} className='h-4 w-4 text-white dark:text-primary-900' />
            )}
          </span>
        </div>
      </div>
    </label>
  );
};

interface IPollOption {
  poll: PollEntity
  option: PollOptionEntity
  index: number
  showResults?: boolean
  active: boolean
  onToggle: (value: number) => void
}

const PollOption: React.FC<IPollOption> = (props): JSX.Element | null => {
  const { index, poll, option, showResults } = props;

  const intl = useIntl();

  if (!poll) return null;

  const pollVotesCount = poll.voters_count || poll.votes_count;
  const percent = pollVotesCount === 0 ? 0 : (option.votes_count / pollVotesCount) * 100;
  const voted = poll.own_votes?.includes(index);
  const message = intl.formatMessage(messages.votes, { votes: option.votes_count });

  const leading = poll.options
    .filter(other => other.title !== option.title)
    .every(other => option.votes_count >= other.votes_count);

  return (
    <div key={option.title}>
      {showResults ? (
        <div title={voted ? message : undefined}>
          <HStack
            justifyContent='between'
            alignItems='center'
            className='relative w-full overflow-hidden rounded-md bg-white p-2 dark:bg-primary-800'
          >
            <PollPercentageBar percent={percent} leading={leading} />

            <div className='text-primary-600 dark:text-white'>
              <Text
                theme='inherit'
                weight='medium'
                dangerouslySetInnerHTML={{ __html: option.title_emojified }}
                className='relative'
              />
            </div>

            <HStack space={2} alignItems='center' className='relative'>
              {voted ? (
                <Icon
                  src={require('@tabler/icons/circle-check.svg')}
                  alt={intl.formatMessage(messages.voted)}
                  className='h-4 w-4 text-primary-600 dark:fill-white dark:text-primary-800'
                />
              ) : (
                <div className='svg-icon' />
              )}

              <div className='text-primary-600 dark:text-white'>
                <Text weight='medium' theme='inherit'>{Math.round(percent)}%</Text>
              </div>
            </HStack>
          </HStack>
        </div>
      ) : (
        <PollOptionText percent={percent} {...props} />
      )}
    </div>
  );
};

export default PollOption;
