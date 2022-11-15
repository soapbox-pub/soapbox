import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import CopyableInput from 'soapbox/components/copyable-input';
import { Column, Stack, Form, FormGroup, Input, Text, FormActions, Button } from 'soapbox/components/ui';
import { useApi, useAppDispatch } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.ads_token.heading', defaultMessage: 'Advertiser Token' },
  error: { id: 'ads_token.error', defaultMessage: 'There was a problem obtaining the token. Are you sure your password is correct?' },
});

interface OAuthToken {
  access_token: string,
}

interface IAdsToken {
}

/** Obtains an OAuth token with `ads` scope only. */
const AdsToken: React.FC<IAdsToken> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const api = useApi();

  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setPassword(target.value);
  };

  const handleSubmit = () => {
    setSubmitting(true);

    api.post<OAuthToken>('/oauth/token', {}).then(({ data }) => {
      setToken(data.access_token);
      setSubmitting(false);
    }).catch(() => {
      dispatch(snackbar.error(intl.formatMessage(messages.error)));
      setSubmitting(false);
    });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/settings'>
      <Stack space={4}>
        {token ? (
          <>
            <Text>
              <FormattedMessage
                id='ads_token.result'
                defaultMessage='This token will not be shown again. Copy it somewhere safe.'
              />
            </Text>

            <CopyableInput value={token} />
          </>
        ) : (
          <>
            <Text>
              <FormattedMessage
                id='ads_token.intro'
                defaultMessage='Advertisers may use this form to obtain an advertiser token, which can be used to associate ads with your account.'
              />
            </Text>

            <Form onSubmit={handleSubmit}>
              <FormGroup
                labelText={<FormattedMessage id='ads_token.password' defaultMessage='Password' />}
                hintText={<FormattedMessage id='ads_token.password.hint' defaultMessage='Enter your password for the current account.' />}
              >
                <Input
                  type='password'
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={submitting}
                />
              </FormGroup>

              <FormActions>
                <Button type='submit' disabled={submitting}>
                  <FormattedMessage id='ads_token.submit' defaultMessage='Get Token' />
                </Button>
              </FormActions>
            </Form>
          </>
        )}
      </Stack>
    </Column>
  );
};

export default AdsToken;