import genericIcon from 'cryptocurrency-icons/svg/color/generic.svg';
import React from 'react';

/** Get crypto icon URL by ticker symbol, or fall back to generic icon */
const getIcon = (ticker: string): string => {
  const modules: Record<string, any> = import.meta.glob('../../../../node_modules/cryptocurrency-icons/svg/color/*.svg', { eager: true });
  const key = `../../../../node_modules/cryptocurrency-icons/svg/color/${ticker}.svg`;
  return modules[key]?.default || genericIcon;
};

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
