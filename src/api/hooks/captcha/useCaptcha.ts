import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchMe } from 'soapbox/actions/me.ts';
import { closeModal } from 'soapbox/actions/modals.ts';
import { HTTPError } from 'soapbox/api/HTTPError.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { captchaSchema, type CaptchaData } from 'soapbox/schemas/captcha.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  success: { id: 'nostr_signup.captcha_message.sucess', defaultMessage: 'Incredible! You\'ve successfully completed the captcha.' },
  wrong: { id: 'nostr_signup.captcha_message.wrong', defaultMessage: 'Oops! It looks like your captcha response was incorrect. Please try again.' },
  expired: { id: 'nostr_signup.captcha_message.expired', defaultMessage: 'The captcha has expired. Please start over.' },
  error: { id: 'nostr_signup.captcha_message.error', defaultMessage: 'It seems an error has occurred. Please try again. If the problem persists, please contact us.' },
});

function getRandomNumber(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed());
}

const useCaptcha = () => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [captcha, setCaptcha] = useState<CaptchaData>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tryAgain, setTryAgain] = useState<boolean>(false);
  const [yPosition, setYPosition] = useState<number>();
  const [xPosition, setXPosition] = useState<number>();

  const loadCaptcha = async () => {
    try {
      const topI = getRandomNumber(0, (356 - 61));
      const leftI = getRandomNumber(0, (330 - 61));
      const response = await api.get('/api/v1/ditto/captcha');
      const data = captchaSchema.parse(await response.json());
      setCaptcha(data);
      setYPosition(topI);
      setXPosition(leftI);
    } catch (error) {
      toast.error('Error loading captcha');
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleChangePosition = (point: { x: number; y: number }) => {
    setXPosition(point.x);
    setYPosition(point.y);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (captcha) {
      const result = {
        x: xPosition,
        y: yPosition,
      };

      try {
        await api.post(`/api/v1/ditto/captcha/${captcha.id}/verify`, result);
        dispatch(closeModal('CAPTCHA'));
        await dispatch(fetchMe()); // refetch account so `captcha_solved` changes.
        toast.success(messages.success);
      } catch (error) {
        setTryAgain(true);

        const status = error instanceof HTTPError ? error.response.status : undefined;
        let message;

        switch (status) {
          case 400:
            message = intl.formatMessage(messages.wrong);
            break;
          case 410:
            message = intl.formatMessage(messages.expired);
            break;
          default:
            message = intl.formatMessage(messages.error);
            console.error(error);
            break;
        }

        toast.error(message);
      }
      setIsSubmitting(false);
    }
  };

  return {
    captcha,
    loadCaptcha,
    handleChangePosition,
    handleSubmit,
    isSubmitting,
    tryAgain,
    yPosition,
    xPosition,
  };
};

export default useCaptcha;