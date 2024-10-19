import React from 'react';

import genericIcon from 'soapbox/assets/cryptocurrency/generic.svg';

/** Get crypto icon URL by ticker symbol, or fall back to generic icon */
function getIcon(ticker: string): string {
  const modules: Record<string, { default: string }> = import.meta.glob('../../../assets/cryptocurrency/*.svg', { eager: true });
  const key = `../../../assets/cryptocurrency/${ticker}.svg`;
  return modules[key]?.default || genericIcon;
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
