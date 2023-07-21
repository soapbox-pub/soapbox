import { Map as ImmutableMap } from 'immutable';

import {
  AUTH_APP_CREATED,
  AUTH_LOGGED_IN,
  AUTH_LOGGED_OUT,
  VERIFY_CREDENTIALS_SUCCESS,
  VERIFY_CREDENTIALS_FAIL,
  SWITCH_ACCOUNT,
} from 'soapbox/actions/auth';
import { ME_FETCH_SKIP } from 'soapbox/actions/me';
import { MASTODON_PRELOAD_IMPORT } from 'soapbox/actions/preload';
import { buildAccount } from 'soapbox/jest/factory';
import { AuthAppRecord, AuthTokenRecord, AuthUserRecord, ReducerRecord } from 'soapbox/reducers/auth';

import reducer from '../auth';

describe('auth reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toMatchObject({
      app: {},
      users: {},
      tokens: {},
      me: null,
    });
  });

  describe('AUTH_APP_CREATED', () => {
    it('should copy in the app', () => {
      const token = { token_type: 'Bearer', access_token: 'ABCDEFG' };
      const action = { type: AUTH_APP_CREATED, app: token };

      const result = reducer(undefined, action);
      const expected = AuthAppRecord(token);

      expect(result.app).toEqual(expected);
    });
  });

  describe('AUTH_LOGGED_IN', () => {
    it('should import the token', () => {
      const token = { token_type: 'Bearer', access_token: 'ABCDEFG' };
      const action = { type: AUTH_LOGGED_IN, token };

      const result = reducer(undefined, action);
      const expected = ImmutableMap({ 'ABCDEFG': AuthTokenRecord(token) });

      expect(result.tokens).toEqual(expected);
    });

    it('should merge the token with existing state', () => {
      const state = ReducerRecord({
        tokens: ImmutableMap({ 'ABCDEFG': AuthTokenRecord({ token_type: 'Bearer', access_token: 'ABCDEFG' }) }),
      });

      const expected = ImmutableMap({
        'ABCDEFG': AuthTokenRecord({ token_type: 'Bearer', access_token: 'ABCDEFG' }),
        'HIJKLMN': AuthTokenRecord({ token_type: 'Bearer', access_token: 'HIJKLMN' }),
      });

      const action = {
        type: AUTH_LOGGED_IN,
        token: { token_type: 'Bearer', access_token: 'HIJKLMN' },
      };

      const result = reducer(state, action);
      expect(result.tokens).toEqual(expected);
    });
  });

  describe('AUTH_LOGGED_OUT', () => {
    it('deletes the user', () => {
      const action = {
        type: AUTH_LOGGED_OUT,
        account: buildAccount({ url: 'https://gleasonator.com/users/alex' }),
      };

      const state = ReducerRecord({
        users: ImmutableMap({
          'https://gleasonator.com/users/alex': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' }),
          'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5678', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
        }),
      });

      const expected = ImmutableMap({
        'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5678', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
      });

      const result = reducer(state, action);
      expect(result.users).toEqual(expected);
    });

    it('sets `me` to the next available user', () => {
      const state = ReducerRecord({
        me: 'https://gleasonator.com/users/alex',
        users: ImmutableMap({
          'https://gleasonator.com/users/alex': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' }),
          'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5678', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
        }),
      });

      const action = {
        type: AUTH_LOGGED_OUT,
        account: buildAccount({ url: 'https://gleasonator.com/users/alex' }),
      };

      const result = reducer(state, action);
      expect(result.me).toEqual('https://gleasonator.com/users/benis');
    });
  });

  describe('VERIFY_CREDENTIALS_SUCCESS', () => {
    it('should import the user', () => {
      const action = {
        type: VERIFY_CREDENTIALS_SUCCESS,
        token: 'ABCDEFG',
        account: { id: '1234', url: 'https://gleasonator.com/users/alex' },
      };

      const expected = ImmutableMap({
        'https://gleasonator.com/users/alex':  AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' }),
      });

      const result = reducer(undefined, action);
      expect(result.users).toEqual(expected);
    });

    it('should set the account in the token', () => {
      const action = {
        type: VERIFY_CREDENTIALS_SUCCESS,
        token: 'ABCDEFG',
        account: { id: '1234', url: 'https://gleasonator.com/users/alex' },
      };

      const state = ReducerRecord({
        tokens: ImmutableMap({ 'ABCDEFG': AuthTokenRecord({ token_type: 'Bearer', access_token: 'ABCDEFG' }) }),
      });

      const expected = {
        'ABCDEFG': {
          token_type: 'Bearer',
          access_token: 'ABCDEFG',
          account: '1234',
          me: 'https://gleasonator.com/users/alex',
        },
      };

      const result = reducer(state, action);
      expect(result.tokens.toJS()).toMatchObject(expected);
    });

    it('sets `me` to the account if unset', () => {
      const action = {
        type: VERIFY_CREDENTIALS_SUCCESS,
        token: 'ABCDEFG',
        account: { id: '1234', url: 'https://gleasonator.com/users/alex' },
      };

      const result = reducer(undefined, action);
      expect(result.me).toEqual('https://gleasonator.com/users/alex');
    });

    it('leaves `me` alone if already set', () => {
      const action = {
        type: VERIFY_CREDENTIALS_SUCCESS,
        token: 'ABCDEFG',
        account: { id: '1234', url: 'https://gleasonator.com/users/alex' },
      };

      const state = ReducerRecord({ me: 'https://gleasonator.com/users/benis' });

      const result = reducer(state, action);
      expect(result.me).toEqual('https://gleasonator.com/users/benis');
    });

    it('deletes mismatched users', () => {
      const action = {
        type: VERIFY_CREDENTIALS_SUCCESS,
        token: 'ABCDEFG',
        account: { id: '1234', url: 'https://gleasonator.com/users/alex' },
      };

      const state = ReducerRecord({
        users: ImmutableMap({
          'https://gleasonator.com/users/mk': AuthUserRecord({ id: '4567', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/mk' }),
          'https://gleasonator.com/users/curtis': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/curtis' }),
          'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5432', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
        }),
      });

      const expected = ImmutableMap({
        'https://gleasonator.com/users/alex': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' }),
        'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5432', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
      });

      const result = reducer(state, action);
      expect(result.users).toEqual(expected);
    });

    it('upgrades from an ID to a URL', () => {
      const action = {
        type: VERIFY_CREDENTIALS_SUCCESS,
        token: 'ABCDEFG',
        account: { id: '1234', url: 'https://gleasonator.com/users/alex' },
      };

      const state = ReducerRecord({
        me: '1234',
        users: ImmutableMap({
          '1234': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG' }),
          '5432': AuthUserRecord({ id: '5432', access_token: 'HIJKLMN' }),
        }),
        tokens: ImmutableMap({
          'ABCDEFG': AuthTokenRecord({ access_token: 'ABCDEFG', account: '1234' }),
        }),
      });

      const expected = {
        me: 'https://gleasonator.com/users/alex',
        users: {
          'https://gleasonator.com/users/alex': { id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' },
          '5432': { id: '5432', access_token: 'HIJKLMN' },
        },
        tokens: {
          'ABCDEFG': { access_token: 'ABCDEFG', account: '1234', me: 'https://gleasonator.com/users/alex' },
        },
      };

      const result = reducer(state, action);
      expect(result.toJS()).toMatchObject(expected);
    });
  });

  describe('VERIFY_CREDENTIALS_FAIL', () => {
    it('should delete the failed token if it 403\'d', () => {
      const state = ReducerRecord({
        tokens: ImmutableMap({
          'ABCDEFG': AuthTokenRecord({ token_type: 'Bearer', access_token: 'ABCDEFG' }),
          'HIJKLMN': AuthTokenRecord({ token_type: 'Bearer', access_token: 'HIJKLMN' }),
        }),
      });

      const expected = ImmutableMap({
        'HIJKLMN': AuthTokenRecord({ token_type: 'Bearer', access_token: 'HIJKLMN' }),
      });

      const action = {
        type: VERIFY_CREDENTIALS_FAIL,
        token: 'ABCDEFG',
        error: { response: { status: 403 } },
      };

      const result = reducer(state, action);
      expect(result.tokens).toEqual(expected);
    });

    it('should delete any users associated with the failed token', () => {
      const state = ReducerRecord({
        users: ImmutableMap({
          'https://gleasonator.com/users/alex': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' }),
          'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5678', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
        }),
      });

      const expected = ImmutableMap({
        'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5678', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
      });

      const action = {
        type: VERIFY_CREDENTIALS_FAIL,
        token: 'ABCDEFG',
        error: { response: { status: 403 } },
      };

      const result = reducer(state, action);
      expect(result.users).toEqual(expected);
    });

    it('should reassign `me` to the next in line', () => {
      const state = ReducerRecord({
        me: 'https://gleasonator.com/users/alex',
        users: ImmutableMap({
          'https://gleasonator.com/users/alex': AuthUserRecord({ id: '1234', access_token: 'ABCDEFG', url: 'https://gleasonator.com/users/alex' }),
          'https://gleasonator.com/users/benis': AuthUserRecord({ id: '5678', access_token: 'HIJKLMN', url: 'https://gleasonator.com/users/benis' }),
        }),
      });

      const action = {
        type: VERIFY_CREDENTIALS_FAIL,
        token: 'ABCDEFG',
        error: { response: { status: 403 } },
      };

      const result = reducer(state, action);
      expect(result.me).toEqual('https://gleasonator.com/users/benis');
    });
  });

  describe('SWITCH_ACCOUNT', () => {
    it('sets the value of `me`', () => {
      const action = {
        type: SWITCH_ACCOUNT,
        account: { url: 'https://gleasonator.com/users/benis' },
      };

      const result = reducer(undefined, action);
      expect(result.me).toEqual('https://gleasonator.com/users/benis');
    });
  });

  describe('ME_FETCH_SKIP', () => {
    it('sets `me` to null', () => {
      const state = ReducerRecord({ me: 'https://gleasonator.com/users/alex' });
      const action = { type: ME_FETCH_SKIP };
      const result = reducer(state, action);
      expect(result.me).toEqual(null);
    });
  });

  describe('MASTODON_PRELOAD_IMPORT', () => {
    it('imports the user and token', () => {
      const action = {
        type: MASTODON_PRELOAD_IMPORT,
        data: require('soapbox/__fixtures__/mastodon_initial_state.json'),
      };

      const expected = {
        me: 'https://mastodon.social/@benis911',
        app: {},
        users: {
          'https://mastodon.social/@benis911': {
            id: '106801667066418367',
            access_token: 'Nh15V9JWyY5Fshf2OJ_feNvOIkTV7YGVfEJFr0Y0D6Q',
            url: 'https://mastodon.social/@benis911',
          },
        },
        tokens: {
          'Nh15V9JWyY5Fshf2OJ_feNvOIkTV7YGVfEJFr0Y0D6Q': {
            access_token: 'Nh15V9JWyY5Fshf2OJ_feNvOIkTV7YGVfEJFr0Y0D6Q',
            account: '106801667066418367',
            me: 'https://mastodon.social/@benis911',
            scope: 'read write follow push',
            token_type: 'Bearer',
          },
        },
      };

      const result = reducer(undefined, action);
      expect(result.toJS()).toMatchObject(expected);
    });
  });
});
