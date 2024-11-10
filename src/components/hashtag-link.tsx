import Link from './link';

interface IHashtagLink {
  hashtag: string;
}

const HashtagLink: React.FC<IHashtagLink> = ({ hashtag }) => (
  // eslint-disable-next-line formatjs/no-literal-string-in-jsx
  <Link to={`/tags/${hashtag}`} onClick={(e) => e.stopPropagation()}>
    #{hashtag}
  </Link>
);

export default HashtagLink;