import React from 'react';

interface IStopPropagation {
  children: React.ReactNode,
}

/**
 * Prevent mouse events from bubbling up.
 *
 * Why is this needed? Because `onClick`, `onMouseDown`, and `onMouseUp` are 3 separate events.
 * To prevent a lot of code duplication, this component can stop all mouse events.
 * Plus, placing it in the component tree makes it more readable.
 */
const StopPropagation: React.FC<IStopPropagation> = ({ children }) => {

  const handler: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onClick={handler} onMouseDown={handler} onMouseUp={handler}>
      {children}
    </div>
  );
};

export default StopPropagation;