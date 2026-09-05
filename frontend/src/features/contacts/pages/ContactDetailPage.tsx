import React from 'react';

export interface ContactDetailPageProps {
  children?: React.ReactNode;
}

export const ContactDetailPage: React.FC<ContactDetailPageProps> = () => {
  return (
    <div className="contactdetailpage">
      <h3>ContactDetailPage</h3>
    </div>
  );
};

export default ContactDetailPage;
