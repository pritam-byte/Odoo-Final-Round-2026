import React from 'react';

export interface ProductListPageProps {
  children?: React.ReactNode;
}

export const ProductListPage: React.FC<ProductListPageProps> = () => {
  return (
    <div className="productlistpage">
      <h3>ProductListPage</h3>
    </div>
  );
};

export default ProductListPage;
