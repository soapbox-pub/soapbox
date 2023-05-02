import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { TagInput } from 'soapbox/components/ui';
import { badgeToTag, tagToBadge } from 'soapbox/utils/badges';

const messages = defineMessages({
  placeholder: { id: 'badge_input.placeholder', defaultMessage: 'Enter a badge…' },
});

interface IBadgeInput {
  /** A badge is a tag that begins with `badge:` */
  badges: string[]
  /** Callback when badges change. */
  onChange: (badges: string[]) => void
}

/** Manages user badges. */
const BadgeInput: React.FC<IBadgeInput> = ({ badges, onChange }) => {
  const intl = useIntl();
  const tags = badges.map(badgeToTag);

  const handleTagsChange = (tags: string[]) => {
    const badges = tags.map(tagToBadge);
    onChange(badges);
  };

  return (
    <TagInput
      tags={tags}
      onChange={handleTagsChange}
      placeholder={intl.formatMessage(messages.placeholder)}
    />
  );
};

export default BadgeInput;