import React from 'react';

export interface JournalListPageProps {
  children?: React.ReactNode;
}

export const JournalListPage: React.FC<JournalListPageProps> = () => {
  return (
    <div className="journallistpage">
      <h3>JournalListPage</h3>
    </div>
  );
};

export default JournalListPage;
