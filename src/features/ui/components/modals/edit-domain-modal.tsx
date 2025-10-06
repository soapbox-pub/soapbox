import { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { closeModal } from '@/actions/modals.ts';
import { useDomains } from '@/api/hooks/admin/index.ts';
import FormGroup from '@/components/ui/form-group.tsx';
import Form from '@/components/ui/form.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Input from '@/components/ui/input.tsx';
import Modal from '@/components/ui/modal.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import Toggle from '@/components/ui/toggle.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { Domain } from '@/schemas/index.ts';
import toast from '@/toast.tsx';

const messages = defineMessages({
  save: { id: 'admin.edit_domain.save', defaultMessage: 'Save' },
  domainPlaceholder: { id: 'admin.edit_domain.fields.domain_placeholder', defaultMessage: 'Identity domain name' },
  domainCreateSuccess: { id: 'admin.edit_domain.created', defaultMessage: 'Domain created' },
  domainUpdateSuccess: { id: 'admin.edit_domain.updated', defaultMessage: 'Domain edited' },
});

interface IEditDomainModal {
  onClose: (type?: string) => void;
  domainId?: string;
}

const EditDomainModal: React.FC<IEditDomainModal> = ({ onClose, domainId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { data: domains, createDomain, isCreating, updateDomain, isUpdating } = useDomains();

  const [domain] = useState<Domain | null>(domainId ? domains!.find(({ id }) => domainId === id)! : null);
  const [domainName, setDomainName] = useState(domain?.domain || '');
  const [isPublic, setPublic] = useState(domain?.public || false);

  const onClickClose = () => {
    onClose('EDIT_DOMAIN');
  };

  const handleSubmit = () => {
    if (domainId) {
      updateDomain({
        id: domainId,
        public: isPublic,
      }, {
        onSuccess: () => {
          toast.success(messages.domainUpdateSuccess);
          dispatch(closeModal('EDIT_DOMAIN'));
        },
      });
    } else {
      createDomain({
        domain: domainName,
        public: isPublic,
      }, {
        onSuccess: () => {
          toast.success(messages.domainCreateSuccess);
          dispatch(closeModal('EDIT_DOMAIN'));
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={domainId
        ? <FormattedMessage id='column.admin.edit_domain' defaultMessage='Edit domain' />
        : <FormattedMessage id='column.admin.create_domain' defaultMessage='Create domaian' />}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
      confirmationDisabled={isCreating || isUpdating}
    >
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_domain.fields.domain_label' defaultMessage='Domain' />}
        >
          <Input
            autoComplete='off'
            placeholder={intl.formatMessage(messages.domainPlaceholder)}
            value={domainName}
            onChange={({ target }) => setDomainName(target.value)}
            disabled={!!domainId}
          />
        </FormGroup>
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={isPublic}
            onChange={({ target }) => setPublic(target.checked)}
          />
          <Stack>
            <Text tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_domain.fields.public_label' defaultMessage='Public' />
            </Text>
            <Text size='xs' tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_domain.fields.all_day_hint' defaultMessage='When checked, everyone can sign up for an username with this domain' />
            </Text>
          </Stack>
        </HStack>
      </Form>
    </Modal>
  );
};

export default EditDomainModal;
