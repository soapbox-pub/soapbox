
import genericIcon from 'soapbox/assets/cryptocurrency/generic.svg';

/** Get crypto icon URL by ticker symbol, or fall back to generic icon */
function getIcon(ticker: string): string {
  try {
    return new URL(`../../../assets/cryptocurrency/${ticker}.svg`, import.meta.url).href;
  } catch {
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
