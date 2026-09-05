import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocuments } from '../api';
import { DocumentType, UserDocumentStatus } from '../schemas';

export interface PortalDocumentListPageProps {
  documentType?: DocumentType;
  onNavigate: (view: string, docId?: string) => void;
}

export const PortalDocumentListPage: React.FC<PortalDocumentListPageProps> = ({
  documentType,
  onNavigate
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserDocumentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allDocs = getMyScopedDocuments(documentType);

  const filteredDocs = allDocs.filter((doc) => {
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesSearch = doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.date.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const pageHeading = documentType === 'bill' ? 'My Bills' : (documentType === 'invoice' ? 'My Invoices' : 'My Invoices & Bills');
  const pageSub = documentType === 'bill' ? 'Browse and settle your vendor bills.' : 'Browse and settle your customer invoices.';

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ margin: '0 0 4px 0' }}>{pageHeading}</h1>
          <p className="text-muted" style={{ margin: 0 }}>{pageSub}</p>
        </div>
      </div>

      {/* Filter and Tab Bar Card */}
      <div className="ds-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs: Paid / Unpaid */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--color-gray-bg)', padding: '4px', borderRadius: 'var(--button-radius)' }}>
            {(['ALL', 'Unpaid', 'Paid'] as const).map((tab) => {
              const isSelected = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--color-white)' : 'transparent',
                    boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.8125rem',
                    color: isSelected ? 'var(--color-charcoal-dark)' : 'var(--color-gray-medium)',
                    cursor: 'pointer'
                  }}
                >
                  {tab === 'ALL' ? 'All Records' : tab}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search by number or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: 'var(--button-radius)',
                border: '1px solid var(--color-gray-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '0.85rem',
                color: 'var(--color-charcoal-dark)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="ds-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ds-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Number</th>
              <th>Partner (Self)</th>
              <th>Total Amount</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-gray-medium)' }}>
                  No documents found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('detail', doc.id)}>
                  <td>{doc.date}</td>
                  <td><strong>{doc.number}</strong></td>
                  <td>{doc.partnerName}</td>
                  <td>${doc.total.toFixed(2)}</td>
                  <td style={{ fontWeight: doc.amountDue > 0 ? 600 : 400, color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-gray-medium)' }}>
                    ${doc.amountDue.toFixed(2)}
                  </td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant={doc.status === 'Unpaid' ? 'primary' : 'secondary'}
                      style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('detail', doc.id);
                      }}
                    >
                      {doc.status === 'Unpaid' ? 'Pay Dues' : 'View'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortalDocumentListPage;
