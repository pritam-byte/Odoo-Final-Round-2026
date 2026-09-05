import React from 'react';

export interface ContactFormPageProps {
  children?: React.ReactNode;
}

export const ContactFormPage: React.FC<ContactFormPageProps> = () => {
  return (
    <div className="contactformpage">
      <h3>ContactFormPage</h3>
    </div>
  );
};

export default ContactFormPage;
