import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { authLoggedIn, verifyCredentials } from 'soapbox/actions/auth';
import { obtainOAuthToken } from 'soapbox/actions/oauth';
import { Button, Form, Input, Spinner } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

export const NostrBunkerLogin: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = async () => {
    const url = new URL(uri);
    const params = new URLSearchParams(url.search);

    // https://github.com/denoland/deno/issues/26440
    const pubkey = url.hostname || url.pathname.slice(2);
    const secret = params.get('secret');
    const relays = params.getAll('relay');

    setLoading(true);

    const token = await dispatch(obtainOAuthToken({
      grant_type: 'nostr_bunker',
      pubkey,
      relays,
      secret,
    }));

    const { access_token } = dispatch(authLoggedIn(token));
    await dispatch(verifyCredentials(access_token as string));

    history.push('/');

    setLoading(false);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Form onSubmit={onSubmit}>
      <Input value={uri} onChange={(e) => setUri(e.target.value)} placeholder='bunker://' />
      <Button type='submit' theme='primary'>
        <FormattedMessage id='login.log_in' defaultMessage='Log in' />
      </Button>
    </Form>
  );
};

export default NostrBunkerLogin;