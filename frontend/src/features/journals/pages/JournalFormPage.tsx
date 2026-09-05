import React from 'react';

export interface JournalFormPageProps {
  children?: React.ReactNode;
}

export const JournalFormPage: React.FC<JournalFormPageProps> = () => {
  return (
    <div className="journalformpage">
      <h3>JournalFormPage</h3>
    </div>
  );
};

export default JournalFormPage;
