import React from 'react';

import Link from './link';

interface IHashtagLink {
  hashtag: string;
}

const HashtagLink: React.FC<IHashtagLink> = ({ hashtag }) => (
  // eslint-disable-next-line formatjs/no-literal-string-in-jsx
  <Link to={`/tags/${hashtag}`}>
    #{hashtag}
  </Link>
);

export default HashtagLink;