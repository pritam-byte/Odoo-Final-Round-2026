import React from 'react';

export interface JournalEntryListPageProps {
  children?: React.ReactNode;
}

export const JournalEntryListPage: React.FC<JournalEntryListPageProps> = () => {
  return (
    <div className="journalentrylistpage">
      <h3>JournalEntryListPage</h3>
    </div>
  );
};

export default JournalEntryListPage;
