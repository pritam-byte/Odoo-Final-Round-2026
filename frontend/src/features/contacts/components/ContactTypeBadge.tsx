import React from 'react';

export interface ContactTypeBadgeProps {
  children?: React.ReactNode;
}

export const ContactTypeBadge: React.FC<ContactTypeBadgeProps> = () => {
  return (
    <div className="contacttypebadge">
      <h3>ContactTypeBadge</h3>
    </div>
  );
};

export default ContactTypeBadge;
