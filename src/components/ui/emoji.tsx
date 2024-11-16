interface IEmoji {
  /** Unicode emoji character. */
  emoji: string;
  /** Size to render the emoji. */
  size?: number;
}

/** A single emoji image. */
const Emoji: React.FC<IEmoji> = (props): JSX.Element | null => {
  const { emoji, size = 16 } = props;
  const px = `${size}px`;

  return (
    <div className='inline-flex items-center justify-center font-emoji leading-[0]' style={{ width: px, height: px, fontSize: px }}>
      {emoji}
    </div>
  );
};

export default Emoji;
