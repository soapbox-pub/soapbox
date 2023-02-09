import React from 'react';
import ReactDOM from 'react-dom';

interface IPortal {
  children: React.ReactNode
}

/**
 * Portal
 */
const Portal: React.FC<IPortal> = ({ children }) => ReactDOM.createPortal(
  children,
  document.querySelector('#soapbox') as HTMLDivElement,
);

export default Portal;