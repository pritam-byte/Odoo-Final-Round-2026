import React from 'react';

export interface JournalEntryEditorPageProps {
  children?: React.ReactNode;
}

export const JournalEntryEditorPage: React.FC<JournalEntryEditorPageProps> = () => {
  return (
    <div className="journalentryeditorpage">
      <h3>JournalEntryEditorPage</h3>
    </div>
  );
};

export default JournalEntryEditorPage;
