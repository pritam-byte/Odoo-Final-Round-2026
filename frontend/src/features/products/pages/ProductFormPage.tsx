import React from 'react';

export interface ProductFormPageProps {
  children?: React.ReactNode;
}

export const ProductFormPage: React.FC<ProductFormPageProps> = () => {
  return (
    <div className="productformpage">
      <h3>ProductFormPage</h3>
    </div>
  );
};

export default ProductFormPage;
