import React from 'react';

export interface JournalEntryDetailPageProps {
  children?: React.ReactNode;
}

export const JournalEntryDetailPage: React.FC<JournalEntryDetailPageProps> = () => {
  return (
    <div className="journalentrydetailpage">
      <h3>JournalEntryDetailPage</h3>
    </div>
  );
};

export default JournalEntryDetailPage;
