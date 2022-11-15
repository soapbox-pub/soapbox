import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import CopyableInput from 'soapbox/components/copyable-input';
import { Column, Stack, Form, FormGroup, Input, Text, FormActions, Button } from 'soapbox/components/ui';
import { useApi, useAppDispatch, useOwnAccount } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.ads_token.heading', defaultMessage: 'Advertiser Token' },
  error: { id: 'ads_token.error', defaultMessage: 'There was a problem obtaining the token. Are you sure your password is correct?' },
});

interface OAuthApp {
  client_id: string,
  client_secret: string,
}

interface OAuthToken {
  access_token: string,
}

const useAdsToken = () => {
  const api = useApi();

  const createAdsApp = async(): Promise<OAuthApp> => {
    const { data: app } = await api.post<OAuthApp>('/api/v1/apps', {
      client_name: 'Soapbox Ads',
      redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: 'ads',
    });

    return app;
  };

  const obtainAdsToken = async(username: string, password: string): Promise<OAuthToken> => {
    const app = await createAdsApp();

    const { data: token } = await api.post<OAuthToken>('/oauth/token', {
      grant_type: 'password',
      client_id: app.client_id,
      client_secret: app.client_secret,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      scope: 'ads',
      username,
      password,
    });

    return token;
  };

  return {
    obtainAdsToken,
  };
};

interface IAdsToken {
}

/** Obtains an OAuth token with `ads` scope only. */
const AdsToken: React.FC<IAdsToken> = () => {
  const intl = useIntl();
  const account = useOwnAccount();
  const dispatch = useAppDispatch();
  const { obtainAdsToken } = useAdsToken();

  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setPassword(target.value);
  };

  const handleSubmit = () => {
    if (account && password) {
      setSubmitting(true);
      obtainAdsToken(account.username, password).then(token => {
        setToken(token.access_token);
        setSubmitting(false);
      }).catch(() => {
        dispatch(snackbar.error(intl.formatMessage(messages.error)));
        setSubmitting(false);
      });
    }
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