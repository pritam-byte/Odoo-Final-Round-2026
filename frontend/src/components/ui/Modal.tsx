import React from 'react';

export interface ModalProps {
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = () => {
  return (
    <div className="modal">
      <h3>Modal</h3>
    </div>
  );
};

export default Modal;
