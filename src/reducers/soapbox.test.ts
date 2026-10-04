import { describe, expect, it } from 'vitest';

import soapboxConfig from '@/__fixtures__/admin_api_frontend_config.json';
import soapbox from '@/__fixtures__/soapbox.json';
import { ADMIN_CONFIG_UPDATE_SUCCESS } from '@/actions/admin.ts';
import * as actions from '@/actions/soapbox.ts';

import reducer from './soapbox.ts';

describe('soapbox reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('should handle SOAPBOX_CONFIG_REQUEST_SUCCESS', () => {
    const state = { brandColor: '#354e91' };
    const action = {
      type: actions.SOAPBOX_CONFIG_REQUEST_SUCCESS,
      soapboxConfig: soapbox,
    };
    expect(reducer(state, action)).toMatchObject({
      brandColor: '#254f92',
    });
  });

  // it('should handle SOAPBOX_CONFIG_REQUEST_FAIL', () => {
  //   const state = { skipAlert: false, brandColor: '#354e91' };
  //   const action = {
  //     type: actions.SOAPBOX_CONFIG_REQUEST_FAIL,
  //     skipAlert: true,
  //   };
  //   expect(reducer(state, action)).toMatchObject({
  //     skipAlert: true,
  //     brandColor: '#354e91',
  //   });
  // });

  it('should handle ADMIN_CONFIG_UPDATE_SUCCESS', () => {
    const state = { brandColor: '#354e91' };
    const action = {
      type: ADMIN_CONFIG_UPDATE_SUCCESS,
      configs: soapboxConfig.configs,
    };
    expect(reducer(state, action)).toMatchObject({
      brandColor: '#254f92',
    });
  });

});
