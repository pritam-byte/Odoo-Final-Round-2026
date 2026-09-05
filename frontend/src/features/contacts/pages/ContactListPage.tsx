import React from 'react';

export interface ContactListPageProps {
  children?: React.ReactNode;
}

export const ContactListPage: React.FC<ContactListPageProps> = () => {
  return (
    <div className="contactlistpage">
      <h3>ContactListPage</h3>
    </div>
  );
};

export default ContactListPage;
