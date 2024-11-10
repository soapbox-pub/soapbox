import { ONBOARDING_START, ONBOARDING_END } from 'soapbox/actions/onboarding.ts';

import type { OnboardingActions } from 'soapbox/actions/onboarding.ts';

type OnboardingState = {
  needsOnboarding: boolean;
}

const initialState: OnboardingState = {
  needsOnboarding: false,
};

export default function onboarding(state: OnboardingState = initialState, action: OnboardingActions): OnboardingState {
  switch (action.type) {
    case ONBOARDING_START:
      return { ...state, needsOnboarding: true };
    case ONBOARDING_END:
      return { ...state, needsOnboarding: false };
    default:
      return state;
  }
}
