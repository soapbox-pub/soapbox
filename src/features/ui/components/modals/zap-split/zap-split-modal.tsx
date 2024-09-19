import React, { useState, useEffect }  from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';

import { zap } from 'soapbox/actions/interactions';
import { SplitValue } from 'soapbox/api/hooks/zap-split/useZapSplit';
import { Modal } from 'soapbox/components/ui';
import ZapSplit from 'soapbox/features/ui/components/modals/zap-split/zap-split';
import { ZapSplitData } from 'soapbox/schemas/zap-split';

import type { AppDispatch } from 'soapbox/store';

interface IZapSplitModal {
  zapSplitAccounts: ZapSplitData[];
  splitValues: SplitValue[];
  onClose:(type?: string) => void;
}

const ZapSplitModal: React.FC<IZapSplitModal> = ({ zapSplitAccounts, onClose, splitValues }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStep, setCurrentStep] = useState(0);
  const [widthModal, setWidthModal] = useState<
    'xl' | 'xs' | 'sm' | 'md' | 'lg' | '2xl' | '3xl' | '4xl' | undefined
  >('sm');
  const [invoice, setInvoice] = useState(undefined);

  const handleNextStep = () => {
    setInvoice(undefined);
    setWidthModal('sm');
    setCurrentStep((prevStep) => Math.min(prevStep + 1, zapSplitAccounts.length - 1));
  };

  const formattedData = zapSplitAccounts.map((splitData) => {
    const amount =
      splitValues.find((item) => item.id === splitData.account.id)?.amountSplit ??
      0;
    return {
      acc: splitData,
      zapAmount: amount,
    };
  });


  const handleSubmit = async () => {
    const zapComment = '';
    const account = formattedData[currentStep].acc.account;
    const zapAmount = formattedData[currentStep].zapAmount;

    const invoice = await dispatch(
      zap(account, undefined, zapAmount * 1000, zapComment),
    );

    if (!invoice) {
      if (currentStep === zapSplitAccounts.length - 1) {
        onClose('ZAP_SPLIT');
        return;
      }
      handleNextStep();
      return;
    }

    setInvoice(invoice);
    setWidthModal('2xl');
  };

  useEffect(() => {
    if (formattedData.length > 0) {
      handleSubmit();
    }
  }, [currentStep]);

  const onClickClose = () => {
    onClose('ZAP_SPLIT');
  };

  const handleFinish = () => {
    onClose('ZAP_SPLIT');
  };

  const renderTitle = () => {
    return (
      <FormattedMessage id='zap_split.title' defaultMessage='Zap Split' />
    );
  };

  return (
    <Modal title={renderTitle()} onClose={onClickClose} width={widthModal}>
      <div className='relative flex flex-col sm:flex-row'>
        {formattedData.length > 0 && (
          <ZapSplit
            zapData={formattedData[currentStep].acc}
            zapAmount={formattedData[currentStep].zapAmount}
            invoice={invoice}
            onNext={handleNextStep}
            isLastStep={currentStep === zapSplitAccounts.length - 1}
            onFinish={handleFinish}
          />
        )}
        <p className='absolute -bottom-4 -right-2'>
          <span className='font-bold'>
            {currentStep + 1}/{zapSplitAccounts.length}
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default ZapSplitModal;
