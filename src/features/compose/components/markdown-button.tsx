import markdownIcon from '@tabler/icons/outline/markdown.svg';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeContentType } from 'soapbox/actions/compose.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useCompose } from 'soapbox/hooks/useCompose.ts';

import ComposeFormButton from './compose-form-button.tsx';

const messages = defineMessages({
  marked: { id: 'compose_form.markdown.marked', defaultMessage: 'Post markdown enabled' },
  unmarked: { id: 'compose_form.markdown.unmarked', defaultMessage: 'Post markdown disabled' },
});

interface IMarkdownButton {
  composeId: string;
}

const MarkdownButton: React.FC<IMarkdownButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const active = useCompose(composeId).content_type === 'text/markdown';

  const onClick = () => dispatch(changeComposeContentType(composeId, active ? 'text/plain' : 'text/markdown'));

  return (
    <ComposeFormButton
      icon={markdownIcon}
      title={intl.formatMessage(active ? messages.marked : messages.unmarked)}
      active={active}
      onClick={onClick}
    />
  );

};

export default MarkdownButton;
