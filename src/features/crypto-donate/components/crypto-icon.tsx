import genericIcon from 'soapbox/assets/cryptocurrency/generic.svg';

const icons = import.meta.glob('../../../assets/cryptocurrency/*.svg', { eager: true });

/** Get crypto icon URL by ticker symbol, or fall back to generic icon */
function getIcon(ticker: string): string {
  const iconPath = `../../../assets/cryptocurrency/${ticker}.svg`;

  if (icons[iconPath]) {
    return new URL(iconPath, import.meta.url).href;
  } else {
    return genericIcon;
  }
}

interface ICryptoIcon {
  ticker: string;
  title?: string;
  className?: string;
}

const CryptoIcon: React.FC<ICryptoIcon> = ({ ticker, title, className }): JSX.Element => {
  return (
    <div className={className}>
      <img
        src={getIcon(ticker)}
        alt={title || ticker}
      />
    </div>
  );
};

export default CryptoIcon;
