import React, { useState } from 'react';
import { Search, CreditCard } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getMyScopedDocuments } from '../api';
import { DocumentType, UserDocumentStatus } from '../schemas';

export interface PortalDocumentListPageProps {
  documentType?: DocumentType;
  onNavigate: (view: string, docId?: string) => void;
}

export const PortalDocumentListPage: React.FC<PortalDocumentListPageProps> = ({
  documentType,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserDocumentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allDocs = getMyScopedDocuments(documentType);

  const filteredDocs = allDocs.filter((doc) => {
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesSearch =
      doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.date.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const pageHeading =
    documentType === 'bill'
      ? 'My Bills'
      : documentType === 'invoice'
      ? 'My Invoices'
      : 'My Invoices & Bills';
  const pageSub =
    documentType === 'bill'
      ? 'Browse and settle your vendor bills.'
      : 'Browse and settle your customer invoices.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="content-header">
        <div>
          <h1 className="page-title">{pageHeading}</h1>
          <p className="page-subtitle">{pageSub}</p>
        </div>
      </div>

      {/* Filter and Tab Bar Card */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs: All / Unpaid / Paid */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-bg)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            {(['ALL', 'Unpaid', 'Paid'] as const).map((tab) => {
              const isSelected = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`btn btn-sm ${isSelected ? 'btn-outline' : 'btn-ghost'}`}
                  style={{
                    boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {tab === 'ALL' ? 'All Records' : tab}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="search-bar-wrapper">
            <div className="search-bar-icon">
              <Search size={15} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search by number or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '260px' }}
            />
          </div>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="custom-table">
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No documents found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('detail', doc.id)}
                  >
                    <td>{doc.date}</td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{doc.number}</strong>
                    </td>
                    <td>{doc.partnerName}</td>
                    <td style={{ fontWeight: 600 }}>₹{doc.total.toFixed(2)}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-text-muted)',
                      }}
                    >₹{doc.amountDue.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${doc.status === 'Unpaid' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('detail', doc.id);
                        }}
                      >
                        {doc.status === 'Unpaid' ? (
                          <>
                            <CreditCard size={13} />
                            <span>Pay Dues</span>
                          </>
                        ) : (
                          <span>View Details</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalDocumentListPage;
