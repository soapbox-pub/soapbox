import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { authLoggedIn, verifyCredentials } from '@/actions/auth.ts';
import { obtainOAuthToken } from '@/actions/oauth.ts';
import Button from '@/components/ui/button.tsx';
import Form from '@/components/ui/form.tsx';
import Input from '@/components/ui/input.tsx';
import Spinner from '@/components/ui/spinner.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

export const NostrBunkerLogin: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [uri, setUri] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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