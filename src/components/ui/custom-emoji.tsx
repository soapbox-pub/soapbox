interface ICustomEmoji {
  /** Custom emoji URL. */
  url: string;
  /** Image alt text, usually the shortcode. */
  alt?: string;
  /** `img` tag className. Default: `h-[1em]` */
  className?: string;
}

/** A single custom emoji image. */
const CustomEmoji: React.FC<ICustomEmoji> = (props): JSX.Element | null => {
  const { url, alt, className = 'h-[1em]' } = props;

  return (
    <img src={url} alt={alt} className={className} />
  );
};

export default CustomEmoji;
