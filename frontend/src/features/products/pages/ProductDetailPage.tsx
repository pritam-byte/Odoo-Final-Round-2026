import React from 'react';

export interface ProductDetailPageProps {
  children?: React.ReactNode;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = () => {
  return (
    <div className="productdetailpage">
      <h3>ProductDetailPage</h3>
    </div>
  );
};

export default ProductDetailPage;
