import checkIcon from '@tabler/icons/outline/check.svg';
import clsx from 'clsx';
import { defineMessages, useIntl, FormatDateOptions } from 'react-intl';


import Markup from 'soapbox/components/markup.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import { CryptoAddress, LightningAddress } from 'soapbox/features/ui/util/async-components.ts';
import { htmlToPlaintext } from 'soapbox/utils/html.ts';

import type { Account } from 'soapbox/schemas/index.ts';

const getTicker = (value: string): string => (value.match(/\$([a-zA-Z]*)/i) || [])[1];
const isTicker = (value: string): boolean => Boolean(getTicker(value));
const isZapEmoji = (value: string) => /^\u26A1[\uFE00-\uFE0F]?$/.test(value);

const messages = defineMessages({
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
});

const dateFormatOptions: FormatDateOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: '2-digit',
};

interface IProfileField {
  field: Account['fields'][number];
}

/** Renders a single profile field. */
const ProfileField: React.FC<IProfileField> = ({ field }) => {
  const intl = useIntl();
  const valuePlain = htmlToPlaintext(field.value);

  if (isTicker(field.name)) {
    return (
      <CryptoAddress
        ticker={getTicker(field.name).toLowerCase()}
        address={valuePlain}
      />
    );
  } else if (isZapEmoji(field.name)) {
    return <LightningAddress address={valuePlain} />;
  }

  return (
    <dl>
      <dt className='font-bold' title={field.name}>
        {field.name}
      </dt>

      <dd
        className={clsx({ 'text-success-500': field.verified_at })}
        title={valuePlain}
      >
        <HStack space={2} alignItems='center'>
          {field.verified_at && (
            <span className='flex-none' title={intl.formatMessage(messages.linkVerifiedOn, { date: intl.formatDate(field.verified_at, dateFormatOptions) })}>
              <Icon src={checkIcon} />
            </span>
          )}

          <Markup
            className='overflow-hidden break-words'
            tag='span'
            html={{ __html: field.value }}
          />
        </HStack>
      </dd>
    </dl>
  );
};

export default ProfileField;
