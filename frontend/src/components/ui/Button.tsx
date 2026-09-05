import React from 'react';

export interface ButtonProps {
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = () => {
  return (
    <div className="button">
      <h3>Button</h3>
    </div>
  );
};

export default Button;
