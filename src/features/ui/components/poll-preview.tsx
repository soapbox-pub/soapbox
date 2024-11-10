import noop from 'lodash/noop';

import PollOption from 'soapbox/components/polls/poll-option.tsx';
import { Stack } from 'soapbox/components/ui/index.ts';
import { useAppSelector } from 'soapbox/hooks/index.ts';
import { Poll as PollEntity } from 'soapbox/types/entities.ts';

interface IPollPreview {
  pollId: string;
}

const PollPreview: React.FC<IPollPreview> = ({ pollId }) => {
  const poll = useAppSelector((state) => state.polls.get(pollId) as PollEntity);

  if (!poll) {
    return null;
  }

  return (
    <Stack space={2}>
      {poll.options.map((option, i) => (
        <PollOption
          key={i}
          poll={poll}
          option={option}
          index={i}
          showResults={false}
          active={false}
          onToggle={noop}
        />
      ))}
    </Stack>
  );
};

export default PollPreview;
