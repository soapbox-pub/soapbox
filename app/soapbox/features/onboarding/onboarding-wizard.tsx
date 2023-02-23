import clsx from 'clsx';
import React from 'react';
import ReactSwipeableViews from 'react-swipeable-views';

import { endOnboarding } from 'soapbox/actions/onboarding';
import LandingGradient from 'soapbox/components/landing-gradient';
import { HStack } from 'soapbox/components/ui';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';

import AvatarSelectionStep from './steps/avatar-selection-step';
import BioStep from './steps/bio-step';
import CompletedStep from './steps/completed-step';
import CoverPhotoSelectionStep from './steps/cover-photo-selection-step';
import DisplayNameStep from './steps/display-name-step';
import FediverseStep from './steps/fediverse-step';
import SuggestedAccountsStep from './steps/suggested-accounts-step';

const OnboardingWizard = () => {
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [currentStep, setCurrentStep] = React.useState<number>(0);

  const handleSwipe = (nextStep: number) => {
    setCurrentStep(nextStep);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const handleNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleComplete = () => {
    dispatch(endOnboarding());
  };

  const steps = [
    <AvatarSelectionStep onNext={handleNextStep} />,
    <DisplayNameStep onNext={handleNextStep} />,
    <BioStep onNext={handleNextStep} />,
    <CoverPhotoSelectionStep onNext={handleNextStep} />,
    <SuggestedAccountsStep onNext={handleNextStep} />,
  ];

  if (features.federating){
    steps.push(<FediverseStep onNext={handleNextStep} />);
  }

  steps.push(<CompletedStep onComplete={handleComplete} />);

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

  const handleDotClick = (nextStep: number) => {
    setCurrentStep(nextStep);
  };

  React.useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div data-testid='onboarding-wizard'>
      <LandingGradient />

      <main className='flex h-screen flex-col overflow-x-hidden'>
        <div className='flex h-full flex-col items-center justify-center'>
          <ReactSwipeableViews animateHeight index={currentStep} onChangeIndex={handleSwipe}>
            {steps.map((step, i) => (
              <div key={i} className='w-full max-w-[100vw] py-6 sm:mx-auto sm:max-w-lg md:max-w-2xl'>
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
        </div>
      </main>
    </div>
  );
};

export default OnboardingWizard;
