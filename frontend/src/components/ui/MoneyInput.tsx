import React from 'react';

export interface MoneyInputProps {
  children?: React.ReactNode;
}

export const MoneyInput: React.FC<MoneyInputProps> = () => {
  return (
    <div className="moneyinput">
      <h3>MoneyInput</h3>
    </div>
  );
};

export default MoneyInput;
