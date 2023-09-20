/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import * as React from 'react';

import { validateUrl } from '../utils/url';

const LinkPlugin = (): JSX.Element => {
  return <LexicalLinkPlugin validateUrl={validateUrl} />;
};

export default LinkPlugin;
