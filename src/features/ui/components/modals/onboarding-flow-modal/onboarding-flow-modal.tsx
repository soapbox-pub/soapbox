import clsx from 'clsx';
import { useEffect, useState } from 'react';
import ReactSwipeableViews from 'react-swipeable-views';

import { endOnboarding } from 'soapbox/actions/onboarding.ts';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useAppDispatch } from 'soapbox/hooks/index.ts';

import AvatarSelectionModal from './steps/avatar-step.tsx';
import BioStep from './steps/bio-step.tsx';
import CompletedModal from './steps/completed-step.tsx';
import CoverPhotoSelectionModal from './steps/cover-photo-selection-step.tsx';
import DisplayNameStep from './steps/display-name-step.tsx';
import SuggestedAccountsModal from './steps/suggested-accounts-step.tsx';

interface IOnboardingFlowModal {
  onClose(): void;
}

const OnboardingFlowModal: React.FC<IOnboardingFlowModal> = ({ onClose }) => {
  const dispatch = useAppDispatch();

  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleSwipe = (nextStep: number) => {
    setCurrentStep(nextStep);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const handleDotClick = (nextStep: number) => {
    setCurrentStep(nextStep);
  };

  const handleNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleComplete = () => {
    dispatch(endOnboarding());
    onClose();
  };

  const steps = [
    <AvatarSelectionModal onClose={handleComplete} onNext={handleNextStep} />,
    <DisplayNameStep onClose={handleComplete} onNext={handleNextStep} />,
    <BioStep onClose={handleComplete} onNext={handleNextStep} />,
    <CoverPhotoSelectionModal onClose={handleComplete} onNext={handleNextStep} />,
    <SuggestedAccountsModal onClose={handleComplete} onNext={handleNextStep} />,
  ];

  steps.push(<CompletedModal onComplete={handleComplete} />);

  const handleKeyUp = ({ key }: KeyboardEvent): void => {
    switch (key) {
      case 'ArrowLeft':
        handlePreviousStep();
        break;
      case 'ArrowRight':
        handleNextStep();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);


  return (
    <Stack space={4} className='w-full'>
      <Modal width='2xl' onClose={handleComplete} theme='transparent'>
        <Stack space={4}>
          <ReactSwipeableViews animateHeight index={currentStep} onChangeIndex={handleSwipe}>
            {steps.map((step, i) => (
              <div key={i} className='w-full'>
                <div
                  className={clsx({
                    'transition-opacity ease-linear': true,
                    'opacity-0 duration-500': currentStep !== i,
                    'opacity-100 duration-75': currentStep === i,
                  })}
                >
                  {step}
                </div>
              </div>
            ))}
          </ReactSwipeableViews>
          <HStack space={3} alignItems='center' justifyContent='center' className='relative'>
            {steps.map((_, i) => (
              <button
                key={i}
                tabIndex={0}
                onClick={() => handleDotClick(i)}
                className={clsx({
                  'w-5 h-5 rounded-full focus:ring-primary-600 focus:ring-2 focus:ring-offset-2': true,
                  'bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-700/75 hover:bg-gray-400': i !== currentStep,
                  'bg-primary-600': i === currentStep,
                })}
              />
            ))}
          </HStack>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default OnboardingFlowModal;
