import React from 'react';

export interface BrandLogoProps {
  height?: number | string;
  className?: string;
  onClick?: () => void;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  height = 36,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`brand-logo-wrapper ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <img
        src="/urban-furniture-logo.png"
        alt="Urban Furniture"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.brand-logo-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'brand-logo-fallback';
            fallback.style.display = 'flex';
            fallback.style.alignItems = 'center';
            fallback.style.gap = '8px';
            fallback.style.fontWeight = '800';
            fallback.style.fontSize = '18px';
            fallback.style.color = '#0f766e';
            fallback.innerHTML = `
              <div style="width: 32px; height: 32px; border-radius: 6px; background: #0f766e; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900;">U</div>
              <span style="color: #0f766e;">Urban</span> <span style="color: #0f172a;">Furniture</span>
            `;
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
};

export default BrandLogo;
