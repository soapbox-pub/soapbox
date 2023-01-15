/*
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

This source code is licensed under the MIT license found in the
LICENSE file in the /app/soapbox/features/compose/editor directory.
*/

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import * as React from 'react';

import { validateUrl } from '../utils/url';

const LinkPlugin = (): JSX.Element => {
  return <LexicalLinkPlugin validateUrl={validateUrl} />;
};

export default LinkPlugin;
