import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  const baseClasses = 'card';
  const hoverClasses = hover ? 'card-hover' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
